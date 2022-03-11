import type {Readable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event} from "@svelte-in-motion/core";
import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import {encode} from "@svelte-in-motion/encoding";

import type {ICollectionItem} from "./collection";
import {collection} from "./collection";

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

export interface IEncode extends ICollectionItem {
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

    remove(identifier: string): IEncode;

    yield(identifier: string): Promise<Uint8Array>;
}

export function encodequeue(): IEncodeQueueStore {
    const {get, push, subscribe, remove, update} = collection<IEncode>();

    const EVENT_END = event<IEncodeEndEvent>();
    const EVENT_START = event<IEncodeEvent>();

    return {
        EVENT_END,
        EVENT_START,

        subscribe,

        queue(options) {
            const {codec, crf, framerate, frames, height, pixel_format, width} = options;

            const handle = encode({
                codec,
                crf,
                framerate,
                frames,
                height,
                pixel_format,
                width,
            });

            const identifier = push({
                state: ENCODE_STATES.uninitialized,
                completion: 0,
            });

            const destroy_start = handle.EVENT_START.subscribe(() => {
                const encode = update(identifier, {state: ENCODE_STATES.started});

                EVENT_START.dispatch({
                    encode,
                });
            });

            const destroy_progress = handle.EVENT_PROGRESS.subscribe((completion) => {
                update(identifier, {completion});
            });

            handle.result.then((buffer) => {
                destroy_progress();
                destroy_start();

                const encode = update(identifier, {state: ENCODE_STATES.ended});

                EVENT_END.dispatch({
                    encode,
                    video: buffer,
                });
            });

            return identifier;
        },

        remove(identifier) {
            const encode = get(identifier);

            if (encode.state !== ENCODE_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'encodequeue.remove' (encode '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return encode;
        },

        yield(identifier) {
            const encode = get(identifier);

            if (encode.state === ENCODE_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'encodequeue.yield' (encode '${identifier}' already ended)`
                );
            }

            return new Promise<Uint8Array>((resolve) => {
                const destroy = EVENT_END.subscribe(({encode, video}) => {
                    if (identifier === encode.identifier) {
                        resolve(video);
                        destroy();
                    }
                });
            });
        },
    };
}

export const encodes = encodequeue();
