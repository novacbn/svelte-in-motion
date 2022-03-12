import type {Writable} from "svelte/store";
import {get, writable} from "svelte/store";

import {debounce as _debounce, make_scoped_context} from "@svelte-in-motion/core";
import type {IWatchUnsubscriber} from "@svelte-in-motion/storage";
import {WATCH_EVENT_TYPES} from "@svelte-in-motion/storage";

import {STORAGE_USER} from "../storage";

export type IFileStore = Writable<string>;

export const CONTEXT_FRAME = make_scoped_context<IFileStore>("file");

export function file(file: string, text: string = "", debounce: number = 250): IFileStore {
    const store = writable(text, (set) => {
        const read = _debounce(async () => {
            const text = await STORAGE_USER.read_file_text(file);

            set(text);
        }, debounce);

        let destroy: IWatchUnsubscriber | null = null;

        (async () => {
            await STORAGE_USER.watch_directory("/", {
                on_watch(event) {
                    if (
                        event.type === WATCH_EVENT_TYPES.create ||
                        event.type === WATCH_EVENT_TYPES.update
                    ) {
                        read();
                    }
                },
            });
        })();

        return () => {
            if (destroy) destroy();
        };
    });

    const write = _debounce(async (text: string) => {
        await STORAGE_USER.write_file_text(file, text);

        store.set(text);
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

export async function preload_file(path: string, debounce?: number): Promise<IFileStore> {
    const text = await STORAGE_USER.read_file_text(path);

    return file(path, text, debounce);
}
