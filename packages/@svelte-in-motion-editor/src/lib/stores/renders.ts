//import {Check, Clock, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";
import {get} from "svelte/store";

import {render} from "@svelte-in-motion/rendering";
import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event, generate_uuid} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";
import {workspace as make_workspace_context} from "../workspace";

import type {INotification} from "./notifications";
import {bundle} from "@svelte-in-motion/bundling";

export enum RENDER_STATES {
    ended = "ended",

    started = "started",

    uninitialized = "uninitialized",
}

export interface IRenderEvent {
    render: IRender;
}

export interface IRenderEndEvent extends IRenderEvent {
    frames: Uint8Array[];
}

export interface IRender extends ICollectionItem {
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

export interface IRendersStore extends Readable<IRender[]> {
    EVENT_END: IEvent<IRenderEndEvent>;

    EVENT_START: IEvent<IRenderEvent>;

    has(identifier: string): boolean;

    queue(options: IRenderQueueOptions): string;

    remove(identifier: string): IRender;

    track(identifier: string, on_remove?: INotification["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array[]>;
}

export function renders(app: IAppContext): IRendersStore {
    const {notifications} = app;

    const {find, has, push, subscribe: subscribe_store, remove, update} = collection<IRender>();

    const EVENT_END = event<IRenderEndEvent>();
    const EVENT_START = event<IRenderEvent>();

    async function render_job(identifier: string, options: IRenderQueueOptions): Promise<void> {
        const {end, file, start, workspace} = options;

        const context = await make_workspace_context(workspace, app);
        const {framerate, height, maxframes, width} = get(context.configuration);

        const result = await bundle({file, storage: context.storage});

        if ("errors" in result) {
            // TODO: Actually push to global error store
            const [first_error] = result.errors;

            throw new Error(first_error.message);
        }

        const handle = render({
            framerate,
            end,
            maxframes,
            height,
            script: result.script,
            start,
            width,
        });

        const destroy_progress = handle.EVENT_PROGRESS.subscribe((completion) => {
            update("identifier", identifier, {completion});
        });

        const destroy_start = handle.EVENT_START.subscribe(() => {
            const render = update("identifier", identifier, {
                state: RENDER_STATES.started,
            });

            EVENT_START.dispatch({render});
        });

        const destroy_end = handle.EVENT_END.subscribe((frames) => {
            const render = update("identifier", identifier, {
                state: RENDER_STATES.ended,
            });

            EVENT_END.dispatch({render, frames});

            destroy_end();
            destroy_progress();
            destroy_start();
        });
    }

    return {
        EVENT_END,
        EVENT_START,

        subscribe: subscribe_store,

        has,

        queue(options) {
            const {file, workspace} = options;

            const {identifier} = push({
                identifier: generate_uuid(),

                workspace,
                file,

                state: RENDER_STATES.uninitialized,
                completion: 0,
            });

            render_job(identifier, options);
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

                    case RENDER_STATES.started:
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
