//import {Check, Clock, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";
import {get} from "svelte/store";

import {RENDERING_EVENTS} from "@svelte-in-motion/agent";
import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";
import {workspace as make_workspace_context} from "../workspace";

import type {INotificationItem} from "./notifications";
import {bundle} from "@svelte-in-motion/bundling";

export enum RENDER_STATES {
    ended = "ended",

    initializing = "initializing",

    rendering = "rendering",

    uninitialized = "uninitialized",
}

export interface IRenderEvent {
    render: IRenderItem;
}

export interface IRenderEndEvent extends IRenderEvent {
    frames: Uint8Array[];
}

export interface IRenderItem extends ICollectionItem {
    identifier: string;

    workspace: string;

    file: string;

    state: `${RENDER_STATES}`;

    completion: number;
}

export type IRenderQueueOptions = {
    workspace: string;

    file: string;

    end: number;

    start: number;
};

export interface IRendersStore extends Readable<IRenderItem[]> {
    EVENT_END: IEvent<IRenderEndEvent>;

    EVENT_START: IEvent<IRenderEvent>;

    has(identifier: string): boolean;

    queue(options: IRenderQueueOptions): Promise<string>;

    remove(identifier: string): IRenderItem;

    track(identifier: string, on_remove?: INotificationItem["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array[]>;
}

export function renders(app: IAppContext): IRendersStore {
    const {agent, notifications} = app;
    const {rendering} = agent;

    const {find, has, push, subscribe: subscribe_store, remove, update} = collection<IRenderItem>();

    const EVENT_END = event<IRenderEndEvent>();
    const EVENT_START = event<IRenderEvent>();

    return {
        EVENT_END,
        EVENT_START,

        subscribe: subscribe_store,

        has,

        async queue(options) {
            const {end, file, start, workspace} = options;

            const context = await make_workspace_context(workspace, app);
            const {framerate, height, maxframes, width} = get(context.configuration);

            const result = await bundle({file, storage: context.storage});

            if ("errors" in result) {
                // TODO: Actually surface to global error store
                const [first_error] = result.errors;

                throw new Error(first_error.message);
            }

            const identifier = await rendering.start_job({
                framerate,
                end,
                maxframes,
                height,
                script: result.script,
                start,
                width,
            });

            push({
                identifier,

                workspace,
                file,

                state: RENDER_STATES.uninitialized,
                completion: 0,
            });

            const observable = await rendering.watch_job(identifier);

            // TODO: Update RPC protocol to support streaming out-of-order
            // frame by frame. So agents can more efficiently process frames.

            // TODO: Cache frames to temp folder on disk and emit path to event.

            const subscription = observable.subscribe((event) => {
                switch (event.type) {
                    case RENDERING_EVENTS.end: {
                        subscription.unsubscribe();

                        const render = update("identifier", identifier, {
                            state: RENDER_STATES.ended,
                        });

                        EVENT_END.dispatch({
                            render,
                            frames: event.result,
                        });

                        break;
                    }

                    case RENDERING_EVENTS.initialize:
                        update("identifier", identifier, {state: RENDER_STATES.initializing});

                        break;

                    case RENDERING_EVENTS.progress:
                        update("identifier", identifier, {completion: event.completion});

                        break;

                    case RENDERING_EVENTS.start: {
                        const render = update("identifier", identifier, {
                            state: RENDER_STATES.rendering,
                        });

                        EVENT_START.dispatch({
                            render,
                        });

                        break;
                    }
                }
            });

            return identifier;
        },

        remove(identifier) {
            const item = find("identifier", identifier);

            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'renders.remove' (render '${identifier}' is not valid)`
                );
            }

            if (item.state !== RENDER_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'renders.remove' (render '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return item;
        },

        track(identifier, on_remove = undefined) {
            if (!has("identifier", identifier)) {
                throw new ReferenceError(
                    `bad argument #0 to 'renders.track' (render '${identifier}' is not valid)`
                );
            }

            const {identifier: notification_identifier} = notifications.push({
                header: "Tracking render...",
                text: identifier,
                on_remove,
            });

            function update(): void {
                // HACK: We're relying `has` at the top of the function remaining
                // valid through entire lifecycle
                const item = find("identifier", identifier)!;

                switch (item.state) {
                    case RENDER_STATES.ended:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Check,
                            header: "Render Finished",
                            is_dismissible: true,
                        });

                        break;

                    case RENDER_STATES.rendering:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Video,
                            header: "Rendering Frames",
                        });

                        break;

                    case RENDER_STATES.uninitialized:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Clock,
                            header: "Starting Render",
                        });

                        break;
                }
            }

            const destroy_start = EVENT_START.subscribe(({render: item}) => {
                if (item.identifier !== identifier) return;

                update();
            });

            const destroy_end = EVENT_END.subscribe(({render: item}) => {
                if (item.identifier !== identifier) return;

                destroy_end();
                destroy_start();

                update();
            });

            update();
            return notification_identifier;
        },

        yield(identifier) {
            const item = find("identifier", identifier);

            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'renders.yield' (render '${identifier}' is not valid)`
                );
            }

            if (item.state === RENDER_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'renders.yield' (render '${identifier}' already ended)`
                );
            }

            return new Promise<Uint8Array[]>((resolve) => {
                const destroy = EVENT_END.subscribe(({frames, render}) => {
                    if (identifier === render.identifier) {
                        resolve(frames);
                        destroy();
                    }
                });
            });
        },
    };
}
