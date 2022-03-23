import {Check, Clock, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event} from "@svelte-in-motion/core";

import type {ICollectionItem} from "./collection";
import {collection} from "./collection";
import {subscribe} from "../messages";
import type {IRenderEndMessage, IRenderProgressMessage, IRenderStartMessage} from "../types/render";
import {notifications} from "./notifications";

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
    state: `${RENDER_STATES}`;

    completion: number;
}

export type IRenderQueueOptions = {
    file: string;
} & IRenderDimensions &
    IRenderRange;

export interface IRenderQueueStore extends Readable<IRender[]> {
    EVENT_END: IEvent<IRenderEndEvent>;

    EVENT_START: IEvent<IRenderEvent>;

    has(identifier: string): boolean;

    queue(options: IRenderQueueOptions): string;

    remove(identifier: string): IRender;

    track(identifier: string): string;

    yield(identifier: string): Promise<Uint8Array[]>;
}

function renderqueue(): IRenderQueueStore {
    const {get, has, push, subscribe: subscribe_store, remove, update} = collection<IRender>();

    const EVENT_END = event<IRenderEndEvent>();
    const EVENT_START = event<IRenderEvent>();

    return {
        EVENT_END,
        EVENT_START,

        subscribe: subscribe_store,

        has,

        queue(options) {
            const {file, end, height, start, width} = options;

            const identifier = push({
                state: RENDER_STATES.uninitialized,
                completion: 0,
            });

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
                    (detail) => update(identifier, {completion: detail.progress}),
                    iframe_element
                );

                const destroy_start = subscribe<IRenderStartMessage>(
                    "RENDER_START",
                    () => {
                        const render = update(identifier, {state: RENDER_STATES.started});
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

                        const render = update(identifier, {state: RENDER_STATES.ended});
                        EVENT_END.dispatch({render, frames});
                    },
                    iframe_element
                );
            });

            document.body.appendChild(iframe_element);
            return identifier;
        },

        remove(identifier) {
            const render = get(identifier);

            if (render.state !== RENDER_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'renderqueue.remove' (render '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return render;
        },

        track(identifier: string) {
            if (!has(identifier)) {
                throw new Error(
                    `bad argument #0 to 'renderqueue.track' (render '${identifier}' is not valid)`
                );
            }

            const notification_identifier = notifications.push({
                header: "Tracking render...",
                text: identifier,
            });

            function update(): void {
                const render = get(identifier);

                switch (render.state) {
                    case RENDER_STATES.ended:
                        notifications.update(notification_identifier, {
                            icon: Check,
                            header: "Render Finished",
                            dismissible: true,
                        });

                        break;

                    case RENDER_STATES.started:
                        notifications.update(notification_identifier, {
                            icon: Video,
                            header: "Rendering",
                        });

                        break;

                    case RENDER_STATES.uninitialized:
                        notifications.update(notification_identifier, {
                            icon: Clock,
                            header: "Starting Render",
                        });

                        break;
                }
            }

            const destroy_start = EVENT_START.subscribe(({render}) => {
                if (render.identifier !== identifier) return;

                update();
            });

            const destroy_end = EVENT_END.subscribe(({render}) => {
                if (render.identifier !== identifier) return;

                destroy_end();
                destroy_start();

                update();
            });

            update();
            return notification_identifier;
        },

        yield(identifier) {
            const render = get(identifier);

            if (render.state === RENDER_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'renderqueue.yield' (render '${identifier}' already ended)`
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

export const renders = renderqueue();

export const {EVENT_END, EVENT_START} = renders;
