import type {Readable} from "svelte/store";
import {get, writable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event, generate_id} from "@svelte-in-motion/core";
import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import {encode} from "@svelte-in-motion/encoding";

export enum ENCODE_STATES {
    ended = "ended",

    started = "started",

    uninitialized = "uninitialized",
}

export interface IEncodeDimensions {
    width: number;

    height: number;
}

export interface IEncodeEvent {
    encode: IEncode;
}

export interface IEncodeEndEvent extends IEncodeEvent {
    video: Uint8Array;
}

export interface IEncode {
    identifier: string;

    state: `${ENCODE_STATES}`;

    completion: number;
}

export interface IEncodeVideoSettings {
    // NOTE: We're only going to support VP9/WebM for the forseeable future
    codec: ICodecNames;

    crf: number;

    framerate: number;

    pixel_format: IPixelFormatNames;
}

export type IEncodeQueueOptions = {
    frames: Uint8Array[];
} & IEncodeDimensions &
    IEncodeVideoSettings;

export interface IEncodeQueueStore extends Readable<IEncode[]> {
    EVENT_END: IEvent<IEncodeEndEvent>;

    EVENT_START: IEvent<IEncodeEvent>;

    queue(options: IEncodeQueueOptions): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function encodequeue(): IEncodeQueueStore {
    const store = writable<IEncode[]>([]);

    const EVENT_END = event<IEncodeEndEvent>();
    const EVENT_START = event<IEncodeEvent>();

    function add_encode(encode: IEncode): IEncode {
        const renders = get(store);

        store.set([...renders, encode]);
        return encode;
    }

    function get_encode(identifier: string): IEncode {
        const encodes = get(store);
        const index = encodes.findIndex((encode) => encode.identifier === identifier);

        if (index < 0) {
            throw new ReferenceError(
                `bad argument #0 to 'get_encode' (invalid identifer '${identifier}')`
            );
        }

        return encodes[index];
    }

    function update_encode(identifier: string, partial: Partial<IEncode>): IEncode {
        const encodes = get(store);
        const index = encodes.findIndex((encode) => encode.identifier === identifier);

        if (index < 0) {
            throw new ReferenceError(
                `bad argument #0 to 'update_encode' (invalid identifer '${identifier}')`
            );
        }

        const encode = (encodes[index] = {...encodes[index], ...partial});

        store.set(encodes);
        return encode;
    }

    return {
        EVENT_END,
        EVENT_START,

        subscribe: store.subscribe,

        queue(options) {
            const {codec, crf, framerate, frames, height, pixel_format, width} = options;
            const identifier = generate_id();

            const handle = encode({
                codec,
                crf,
                framerate,
                frames,
                height,
                pixel_format,
                width,
            });

            add_encode({
                identifier,
                state: ENCODE_STATES.uninitialized,
                completion: 0,
            });

            const destroy_start = handle.EVENT_START.subscribe(() => {
                const encode = update_encode(identifier, {state: ENCODE_STATES.started});

                EVENT_START.dispatch({
                    encode,
                });
            });

            const destroy_progress = handle.EVENT_PROGRESS.subscribe((completion) => {
                update_encode(identifier, {completion});
            });

            handle.result.then((buffer) => {
                destroy_progress();
                destroy_start();

                const encode = update_encode(identifier, {state: ENCODE_STATES.ended});

                EVENT_END.dispatch({
                    encode,
                    video: buffer,
                });
            });

            return identifier;
        },

        yield(identifier) {
            const render = get_encode(identifier);

            if (render.state === ENCODE_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'encodequeue.yield' (encode '${identifier}' already ended)`
                );
            }

            return new Promise<Uint8Array>((resolve) => {
                const destroy = EVENT_END.subscribe(({encode, video}) => {
                    if (identifier === render.identifier) {
                        resolve(video);
                        destroy();
                    }
                });
            });
        },
    };
}

export const encodes = encodequeue();
