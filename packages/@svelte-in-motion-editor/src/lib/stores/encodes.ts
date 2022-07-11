//import {Check, Clock, Film} from "lucide-svelte";
import type {Readable} from "svelte/store";

import {ENCODING_EVENTS} from "@svelte-in-motion/agent";
import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

import type {INotificationItem} from "./notifications";

export enum ENCODE_STATES {
    ended = "ended",

    encoding = "encoding",

    initializing = "initializing",

    uninitialized = "uninitialized",
}

export interface IEncodeEvent {
    encode: IEncodeItem;
}

export interface IEncodeEndEvent extends IEncodeEvent {
    video: Uint8Array;
}

export interface IEncodeItem extends ICollectionItem {
    identifier: string;

    state: `${ENCODE_STATES}`;

    completion: number;
}

export type IEncodeQueueOptions = {
    // NOTE: We're only going to support VP9/WebM for the forseeable future
    codec: ICodecNames;

    crf: number;

    height: number;

    frames: Uint8Array[];

    framerate: number;

    pixel_format: IPixelFormatNames;

    width: number;
};

export interface IEncodesStore extends Readable<IEncodeItem[]> {
    EVENT_END: IEvent<IEncodeEndEvent>;

    EVENT_START: IEvent<IEncodeEvent>;

    has(identifier: string): boolean;

    queue(options: IEncodeQueueOptions): Promise<string>;

    remove(identifier: string): IEncodeItem;

    track(identifier: string, on_remove?: INotificationItem["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function encodes(app: IAppContext): IEncodesStore {
    const {agent, notifications} = app;
    const {encoding} = agent;

    const {find, has, push, subscribe, remove, update} = collection<IEncodeItem>();

    const EVENT_END = event<IEncodeEndEvent>();
    const EVENT_START = event<IEncodeEvent>();

    return {
        EVENT_END,
        EVENT_START,

        subscribe,

        has,

        async queue(options) {
            const {codec, crf, framerate, frames, height, pixel_format, width} = options;

            const identifier = await encoding.start_job({
                codec,
                crf,
                framerate,
                frames,
                height,
                pixel_format,
                width,
            });

            push({
                identifier,

                state: ENCODE_STATES.uninitialized,
                completion: 0,
            });

            const observable = await encoding.watch_job(identifier);

            // TODO: Cache video to temp file on disk and emit path to event.

            const subscription = observable.subscribe((event) => {
                switch (event.type) {
                    case ENCODING_EVENTS.end: {
                        subscription.unsubscribe();

                        const encode = update("identifier", identifier, {
                            state: ENCODE_STATES.ended,
                        });

                        EVENT_END.dispatch({
                            encode,
                            video: event.result,
                        });

                        break;
                    }

                    case ENCODING_EVENTS.initialize:
                        update("identifier", identifier, {state: ENCODE_STATES.initializing});

                        break;

                    case ENCODING_EVENTS.progress:
                        update("identifier", identifier, {completion: event.completion});

                        break;

                    case ENCODING_EVENTS.start: {
                        const encode = update("identifier", identifier, {
                            state: ENCODE_STATES.encoding,
                        });

                        EVENT_START.dispatch({
                            encode,
                        });

                        break;
                    }
                }
            });

            return identifier;
        },

        remove(identifier) {
            const encode = find("identifier", identifier);

            if (!encode) {
                throw new ReferenceError(
                    `bad argument #0 to 'encodes.remove' (encode '${identifier}' is not valid)`
                );
            }

            if (encode.state !== ENCODE_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'encodes.remove' (encode '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return encode;
        },

        track(identifier, on_remove = undefined) {
            const encode = find("identifier", identifier);
            if (!encode) {
                throw new ReferenceError(
                    `bad argument #0 to 'encodes.track' (encode '${identifier}' is not valid)`
                );
            }

            const {identifier: notification_identifier} = notifications.push({
                namespace: "encodes-tracking-uninitialized",
                tokens: encode,

                on_remove,
            });

            function update(): void {
                // HACK: We're relying reference check at the top of the function
                // remaining valid through entire lifecycle
                const encode = find("identifier", identifier)!;

                switch (encode.state) {
                    case ENCODE_STATES.encoding:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Film,

                            namespace: "encodes-tracking-encoding",
                            tokens: encode,
                        });

                        break;

                    case ENCODE_STATES.ended:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Check,
                            is_dismissible: true,

                            namespace: "encodes-tracking-ended",
                            tokens: encode,
                        });

                        break;

                    case ENCODE_STATES.initializing:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Clock,

                            namespace: "encodes-tracking-initializing",
                            tokens: encode,
                        });

                        break;
                }
            }

            const destroy_start = EVENT_START.subscribe(({encode}) => {
                if (encode.identifier !== identifier) return;

                update();
            });

            const destroy_end = EVENT_END.subscribe(({encode}) => {
                if (encode.identifier !== identifier) return;

                destroy_end();
                destroy_start();

                update();
            });

            update();
            return notification_identifier;
        },

        yield(identifier) {
            const encode = find("identifier", identifier);

            if (!encode) {
                throw new ReferenceError(
                    `bad argument #0 to 'encodes.yield' (encode '${identifier}' is not valid)`
                );
            }

            if (encode.state === ENCODE_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'encodes.yield' (encode '${identifier}' already ended)`
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
