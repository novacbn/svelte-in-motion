import type {Readable} from "svelte/store";
import {get, writable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event, generate_id} from "@svelte-in-motion/core";

import {subscribe} from "../messages";
import type {IRenderEndMessage, IRenderFrameMessage, IRenderStartMessage} from "../types/render";

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

export interface IRender {
    identifier: string;

    element: HTMLIFrameElement;

    state: `${RENDER_STATES}`;

    frame?: number;

    dimensions: IRenderDimensions;

    range: IRenderRange;
}

export type IRenderQueueOptions = {
    file: string;
} & IRenderDimensions &
    IRenderRange;

export interface IRenderQueueStore extends Readable<IRender[]> {
    EVENT_END: IEvent<IRenderEndEvent>;

    EVENT_START: IEvent<IRenderEvent>;

    queue(options: IRenderQueueOptions): string;

    yield(identifier: string): Promise<Uint8Array[]>;
}

function renderqueue(): IRenderQueueStore {
    const store = writable<IRender[]>([]);

    const EVENT_END = event<IRenderEndEvent>();
    const EVENT_START = event<IRenderEvent>();

    function add_render(render: IRender): IRender {
        const renders = get(store);

        store.set([...renders, render]);
        return render;
    }

    function get_render(identifier: string): IRender {
        const renders = get(store);
        const index = renders.findIndex((render) => render.identifier === identifier);

        if (index < 0) {
            throw new ReferenceError(
                `bad argument #0 to 'get_render' (invalid identifer '${identifier}')`
            );
        }

        return renders[index];
    }

    function update_render(identifier: string, partial: Partial<IRender>): IRender {
        const renders = get(store);
        const index = renders.findIndex((render) => render.identifier === identifier);

        if (index < 0) {
            throw new ReferenceError(
                `bad argument #0 to 'update_render' (invalid identifer '${identifier}')`
            );
        }

        const render = (renders[index] = {...renders[index], ...partial});

        store.set(renders);
        return render;
    }

    return {
        EVENT_END,
        EVENT_START,

        subscribe: store.subscribe,

        queue(options) {
            const {file, end, height, start, width} = options;
            const identifier = generate_id();

            const iframe_element = document.createElement("IFRAME") as HTMLIFrameElement;

            // NOTE: Need to hide it so it basically acts like an "off-screen canvas"
            iframe_element.style.position = "fixed";
            iframe_element.style.pointerEvents = "none";
            iframe_element.style.opacity = "0";

            iframe_element.style.height = `${height}px`;
            iframe_element.style.width = `${width}px`;

            iframe_element.src = `/render.html?identifier=${identifier}&file=${file}&start=${start}&end=${end}`;

            add_render({
                identifier,
                element: iframe_element,
                state: RENDER_STATES.uninitialized,
                dimensions: {width, height},
                range: {start, end},
            });

            iframe_element.addEventListener("load", () => {
                const destroy_frame = subscribe<IRenderFrameMessage>(
                    "RENDER_FRAME",
                    (detail) => update_render(identifier, {frame: detail.frame}),
                    iframe_element
                );

                const destroy_start = subscribe<IRenderStartMessage>(
                    "RENDER_START",
                    () => {
                        const render = update_render(identifier, {state: RENDER_STATES.started});
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

                        const render = update_render(identifier, {state: RENDER_STATES.ended});
                        EVENT_END.dispatch({render, frames});
                    },
                    iframe_element
                );
            });

            document.body.appendChild(iframe_element);
            return identifier;
        },

        yield(identifier) {
            const render = get_render(identifier);

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
