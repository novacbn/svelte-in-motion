import {get, writable} from "svelte/store";

import {debounce as _debounce} from "@svelte-in-motion/core";
import type {IWatchUnsubscriber} from "@svelte-in-motion/storage";
import {WATCH_EVENT_TYPES} from "@svelte-in-motion/storage";

import {STORAGE_USER} from "../storage";

import type {IPathStore} from "./path";

export interface IContentStore {
    set: (text: string) => void;

    subscribe: (callback: (text: string | null) => void) => () => void;

    update: (callback: (text: string | null) => string) => void;
}

export function content(path: IPathStore, debounce: number = 250): IContentStore {
    const store = writable<string | null>(null, (set) => {
        const read = _debounce(async () => {
            const file_path = get(path);
            const text = await STORAGE_USER.read_file_text(file_path);

            set(text);
        }, debounce);

        let destroy: IWatchUnsubscriber | null = null;

        path.subscribe(async (file_path) => {
            if (destroy) destroy();

            destroy = await STORAGE_USER.watch_file(file_path, (event) => {
                if (
                    event.type === WATCH_EVENT_TYPES.create ||
                    event.type === WATCH_EVENT_TYPES.update
                ) {
                    read();
                }
            });
        });

        set(null);
        read();

        return () => {
            if (destroy) destroy();
        };
    });

    const write = _debounce(async (text: string) => {
        const content = get(store);
        const file_path = get(path);

        if (content !== text) {
            await STORAGE_USER.write_file_text(file_path, text);
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
