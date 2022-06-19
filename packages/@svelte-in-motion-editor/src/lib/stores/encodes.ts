//import {Check, Clock, Film} from "lucide-svelte";
import type {Readable} from "svelte/store";

import {ENCODING_EVENTS, Agent} from "@svelte-in-motion/agent";
import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

import type {INotification} from "./notifications";

export enum ENCODE_STATES {
    ended = "ended",

    encoding = "encoding",

    initializing = "initializing",

    uninitialized = "uninitialized",
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

export interface IEncodesStore extends Readable<IEncode[]> {
    EVENT_END: IEvent<IEncodeEndEvent>;

    EVENT_START: IEvent<IEncodeEvent>;

    has(identifier: string): boolean;

    queue(options: IEncodeQueueOptions): Promise<string>;

    remove(identifier: string): IEncode;

    track(identifier: string, on_remove?: INotification["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function encodes(app: IAppContext, agent: Agent): IEncodesStore {
    const {encoding} = agent;
    const {notifications} = app;

    const {find, has, push, subscribe, remove, update} = collection<IEncode>();

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
            const item = find("identifier", identifier);

            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'encodes.remove' (encode '${identifier}' is not valid)`
                );
            }

            if (item.state !== ENCODE_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'encodes.remove' (encode '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return item;
        },

        track(identifier, on_remove = undefined) {
            if (!has("identifier", identifier)) {
                throw new ReferenceError(
                    `bad argument #0 to 'encodes.track' (encode '${identifier}' is not valid)`
                );
            }

            const {identifier: notification_identifier} = notifications.push({
                header: "Tracking encode...",
                text: identifier,
                on_remove,
            });

            function update(): void {
                // HACK: We're relying `has` at the top of the function remaining
                // valid through entire lifecycle
                const encode = find("identifier", identifier)!;

                switch (encode.state) {
                    case ENCODE_STATES.encoding:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Film,
                            header: "Encoding Video",
                        });

                        break;

                    case ENCODE_STATES.ended:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Check,
                            header: "Encode Finished",
                            is_dismissible: true,
                        });

                        break;

                    case ENCODE_STATES.uninitialized:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Clock,
                            header: "Starting Encode",
                        });

                        break;
                }
            }

            const destroy_start = EVENT_START.subscribe(({encode: item}) => {
                if (item.identifier !== identifier) return;

                update();
            });

            const destroy_end = EVENT_END.subscribe(({encode: item}) => {
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
                    `bad argument #0 to 'encodes.yield' (encode '${identifier}' is not valid)`
                );
            }

            if (item.state === ENCODE_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'encodes.yield' (encode '${identifier}' already ended)`
                );
            }

            return new Promise<Uint8Array>((resolve) => {
                const destroy = EVENT_END.subscribe(({encode: item, video}) => {
                    if (identifier === item.identifier) {
                        resolve(video);
                        destroy();
                    }
                });
            });
        },
    };
}
