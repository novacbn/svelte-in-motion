import type {Writable} from "svelte/store";
import {get, writable} from "svelte/store";

import {debounce as _debounce} from "@svelte-in-motion/utilities";

import type {IDriver, IWatchUnsubscriber} from "../drivers/driver";
import {WATCH_EVENT_TYPES} from "../drivers/driver";

export type IFileBinaryStore = Writable<Uint8Array | null>;

export type IPreloadedFileBinaryStore = Writable<Uint8Array>;

export type IFileTextStore = Writable<string | null>;

export type IPreloadedFileTextStore = Writable<string>;

export function file_binary(
    driver: IDriver,
    file_path: string,
    initial_value: Uint8Array | null = null,
    debounce: number = 250
): IFileBinaryStore {
    const store = writable<Uint8Array | null>(initial_value, (set) => {
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

    const write = _debounce(async (buffer: Uint8Array | null) => {
        const cache = get(store);

        if (cache !== buffer) {
            if (buffer === null) await driver.remove_file(file_path);
            else await driver.write_file(file_path, buffer);

            store.set(buffer);
        }
    }, debounce);

    return {
        set: (buffer) => {
            write(buffer);
        },

        subscribe: store.subscribe,

        update: (callback) => {
            const buffer = get(store);

            write(callback(buffer));
        },
    };
}

export async function preload_binary(
    driver: IDriver,
    file_path: string,
    debounce?: number
): Promise<IPreloadedFileBinaryStore> {
    const buffer = await driver.read_file(file_path);

    return file_binary(driver, file_path, buffer, debounce) as IPreloadedFileBinaryStore;
}

export function file_text(
    driver: IDriver,
    file_path: string,
    initial_value: string | null = null,
    debounce: number = 250
): IFileTextStore {
    const store = writable<string | null>(initial_value, (set) => {
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

    const write = _debounce(async (text: string | null) => {
        const cache = get(store);

        if (cache !== text) {
            if (text === null) await driver.remove_file(file_path);
            else await driver.write_file_text(file_path, text);

            store.set(text);
        }
    }, debounce);

    return {
        set: (text) => {
            write(text);
        },

        subscribe: store.subscribe,

        update: (callback) => {
            const text = get(store);

            write(callback(text));
        },
    };
}

export async function preload_text(
    driver: IDriver,
    file_path: string,
    debounce?: number
): Promise<IPreloadedFileTextStore> {
    const text = await driver.read_file_text(file_path);

    return file_text(driver, file_path, text, debounce) as IPreloadedFileTextStore;
}
