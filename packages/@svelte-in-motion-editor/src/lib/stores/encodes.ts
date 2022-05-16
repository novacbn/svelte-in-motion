import {Check, Clock, Film} from "lucide-svelte";
import type {Readable} from "svelte/store";

import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import {encode} from "@svelte-in-motion/encoding";
import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event, generate_uuid} from "@svelte-in-motion/utilities";

import type {INotification, INotificationsStore} from "./notifications";

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

export interface IEncodesStore extends Readable<IEncode[]> {
    EVENT_END: IEvent<IEncodeEndEvent>;

    EVENT_START: IEvent<IEncodeEvent>;

    has(identifier: string): boolean;

    queue(options: IEncodeQueueOptions): string;

    remove(identifier: string): IEncode;

    track(identifier: string, on_remove?: INotification["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function encodes(notifications: INotificationsStore): IEncodesStore {
    const {find, has, push, subscribe, remove, update} = collection<IEncode>();

    const EVENT_END = event<IEncodeEndEvent>();
    const EVENT_START = event<IEncodeEvent>();

    return {
        EVENT_END,
        EVENT_START,

        subscribe,

        has,

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

            const item = push({
                identifier: generate_uuid(),
                state: ENCODE_STATES.uninitialized,
                completion: 0,
            });

            const {identifier} = item;

            const destroy_start = handle.EVENT_START.subscribe(() => {
                const encode = update("identifier", identifier, {state: ENCODE_STATES.started});

                EVENT_START.dispatch({
                    encode,
                });
            });

            const destroy_progress = handle.EVENT_PROGRESS.subscribe((completion) => {
                update("identifier", identifier, {completion});
            });

            handle.result.then((buffer) => {
                destroy_progress();
                destroy_start();

                const encode = update("identifier", identifier, {state: ENCODE_STATES.ended});

                EVENT_END.dispatch({
                    encode,
                    video: buffer,
                });
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
                    case ENCODE_STATES.ended:
                        notifications.update("identifier", notification_identifier, {
                            icon: Check,
                            header: "Encode Finished",
                            dismissible: true,
                        });

                        break;

                    case ENCODE_STATES.started:
                        notifications.update("identifier", notification_identifier, {
                            icon: Film,
                            header: "Encoding Video",
                        });

                        break;

                    case ENCODE_STATES.uninitialized:
                        notifications.update("identifier", notification_identifier, {
                            icon: Clock,
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
