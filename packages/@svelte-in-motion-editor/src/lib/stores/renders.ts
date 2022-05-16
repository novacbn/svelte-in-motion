import {Check, Clock, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";

import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event, generate_uuid} from "@svelte-in-motion/utilities";

import type {IRenderEndMessage, IRenderProgressMessage, IRenderStartMessage} from "../types/render";

import {subscribe} from "../messages";

import type {INotification, INotificationsStore} from "./notifications";

export enum RENDER_STATES {
    ended = "ended",

    started = "started",

    uninitialized = "uninitialized",
}

export interface IRenderDimensions {
    width: number;

    height: number;
}

export interface IRenderEvent {
    render: IRender;
}

export interface IRenderEndEvent extends IRenderEvent {
    frames: Uint8Array[];
}

export interface IRenderRange {
    end: number;

    start: number;
}

export interface IRender extends ICollectionItem {
    identifier: string;

    state: `${RENDER_STATES}`;

    completion: number;
}

export type IRenderQueueOptions = {
    file: string;
} & IRenderDimensions &
    IRenderRange;

export interface IRendersStore extends Readable<IRender[]> {
    EVENT_END: IEvent<IRenderEndEvent>;

    EVENT_START: IEvent<IRenderEvent>;

    has(identifier: string): boolean;

    queue(options: IRenderQueueOptions): string;

    remove(identifier: string): IRender;

    track(identifier: string, on_remove?: INotification["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array[]>;
}

export function renders(notifications: INotificationsStore): IRendersStore {
    const {find, has, push, subscribe: subscribe_store, remove, update} = collection<IRender>();

    const EVENT_END = event<IRenderEndEvent>();
    const EVENT_START = event<IRenderEvent>();

    return {
        EVENT_END,
        EVENT_START,

        subscribe: subscribe_store,

        has,

        queue(options) {
            const {file, end, height, start, width} = options;

            const item = push({
                identifier: generate_uuid(),
                state: RENDER_STATES.uninitialized,
                completion: 0,
            });

            const {identifier} = item;

            const iframe_element = document.createElement("IFRAME") as HTMLIFrameElement;

            // NOTE: Need to hide it so it basically acts like an "off-screen canvas"
            iframe_element.style.position = "fixed";
            iframe_element.style.pointerEvents = "none";
            iframe_element.style.opacity = "0";

            iframe_element.style.height = `${height}px`;
            iframe_element.style.width = `${width}px`;

            iframe_element.src = `/render.html?identifier=${identifier}&file=${file}&start=${start}&end=${end}`;

            iframe_element.addEventListener("load", () => {
                const destroy_frame = subscribe<IRenderProgressMessage>(
                    "RENDER_PROGRESS",
                    (detail) => update("identifier", identifier, {completion: detail.progress}),
                    iframe_element
                );

                const destroy_start = subscribe<IRenderStartMessage>(
                    "RENDER_START",
                    () => {
                        const render = update("identifier", identifier, {
                            state: RENDER_STATES.started,
                        });
                        EVENT_START.dispatch({render});
                    },

                    iframe_element
                );

                const destroy_end = subscribe<IRenderEndMessage>(
                    "RENDER_END",
                    async (detail) => {
                        const frames = await Promise.all(
                            detail.frames.map(async (uri, index) => {
                                const response = await fetch(uri);
                                const buffer = await response.arrayBuffer();

                                return new Uint8Array(buffer);
                            })
                        );

                        destroy_end();
                        destroy_frame();
                        destroy_start();

                        iframe_element.remove();

                        const render = update("identifier", identifier, {
                            state: RENDER_STATES.ended,
                        });
                        EVENT_END.dispatch({render, frames});
                    },
                    iframe_element
                );
            });

            document.body.appendChild(iframe_element);
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
            if (!has(identifier)) {
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
                            icon: Check,
                            header: "Render Finished",
                            dismissible: true,
                        });

                        break;

                    case RENDER_STATES.started:
                        notifications.update("identifier", notification_identifier, {
                            icon: Video,
                            header: "Rendering Frames",
                        });

                        break;

                    case RENDER_STATES.uninitialized:
                        notifications.update("identifier", notification_identifier, {
                            icon: Clock,
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
