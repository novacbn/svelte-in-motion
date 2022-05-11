import type {Unsubscriber} from "svelte/store";
import {get, writable} from "svelte/store";

import {debounce as _debounce} from "@svelte-in-motion/utilities";

import type {IDriver, IWatchUnsubscriber} from "../drivers/driver";
import {WATCH_EVENT_TYPES} from "../drivers/driver";

export interface IFileBinaryStore {
    set: (buffer: Uint8Array) => void;

    subscribe: (callback: (buffer: Uint8Array | null) => void) => () => void;

    update: (callback: (buffer: Uint8Array | null) => Uint8Array) => void;
}

export interface IFileTextStore {
    set: (text: string) => void;

    subscribe: (callback: (text: string | null) => void) => () => void;

    update: (callback: (text: string | null) => string) => void;
}

export function file_binary(
    driver: IDriver,
    file_path: string,
    debounce: number = 250
): IFileBinaryStore {
    const store = writable<Uint8Array | null>(null, (set) => {
        const read = _debounce(async () => {
            const buffer = await driver.read_file(file_path);

            set(buffer);
        }, debounce);

        let destroy: IWatchUnsubscriber | null = null;

        (async () => {
            destroy = await driver.watch_file(file_path, (event) => {
                if (
                    event.type === WATCH_EVENT_TYPES.create ||
                    event.type === WATCH_EVENT_TYPES.update
                ) {
                    read();
                }
            });

            read();
        })();

        return () => {
            if (destroy) destroy();
        };
    });

    const write = _debounce(async (buffer: Uint8Array) => {
        const cache = get(store);

        if (cache !== buffer) {
            await driver.write_file(file_path, buffer);

            store.set(buffer);
        }
    }, debounce);

    return {
        set(buffer) {
            write(buffer);
        },

        subscribe: store.subscribe,

        update(callback) {
            const buffer = get(store);

            write(callback(buffer));
        },
    };
}

export function preload_binary(
    driver: IDriver,
    file_path: string,
    debounce?: number
): Promise<IFileBinaryStore> {
    return new Promise((resolve, reject) => {
        const store = file_binary(driver, file_path, debounce);

        let destroy: Unsubscriber;
        destroy = store.subscribe((buffer) => {
            if (buffer !== undefined) {
                if (destroy) destroy();
                resolve(store);
            }
        });
    });
}

export function file_text(
    driver: IDriver,
    file_path: string,
    debounce: number = 250
): IFileTextStore {
    const store = writable<string | null>(null, (set) => {
        const read = _debounce(async () => {
            const text = await driver.read_file_text(file_path);

            set(text);
        }, debounce);

        let destroy: IWatchUnsubscriber | null = null;

        (async () => {
            destroy = await driver.watch_file(file_path, (event) => {
                if (
                    event.type === WATCH_EVENT_TYPES.create ||
                    event.type === WATCH_EVENT_TYPES.update
                ) {
                    read();
                }
            });

            read();
        })();

        return () => {
            if (destroy) destroy();
        };
    });

    const write = _debounce(async (text: string) => {
        const cache = get(store);

        if (cache !== text) {
            await driver.write_file_text(file_path, text);

            store.set(text);
        }
    }, debounce);

    return {
        set(text) {
            write(text);
        },

        subscribe: store.subscribe,

        update(callback) {
            const text = get(store);

            write(callback(text));
        },
    };
}

export function preload_text(
    driver: IDriver,
    file_path: string,
    debounce?: number
): Promise<IFileTextStore> {
    return new Promise((resolve, reject) => {
        const store = file_text(driver, file_path, debounce);

        let destroy: Unsubscriber;
        destroy = store.subscribe((text) => {
            if (text !== undefined) {
                if (destroy) destroy();
                resolve(store);
            }
        });
    });
}
