import type {Writable} from "svelte/store";
import {get, writable} from "svelte/store";

import {debounce as _debounce} from "@svelte-in-motion/animations";
import {make_scoped_context} from "@svelte-in-motion/core";

import {STORAGE_USER} from "../storage";

export type IFileStore = Writable<string>;

export const CONTEXT_FRAME = make_scoped_context<IFileStore>("file");

export function file(file: string, debounce: number = 100): IFileStore {
    const store = writable("", (set) => {
        const read = _debounce(async () => {
            const text = (await STORAGE_USER.getItem(file)) as string;

            set(text);
        }, debounce);

        read();

        STORAGE_USER.watch((event, key) => {
            if (event === "update" && key === `filesystem:user:${file}`) read();
        });
    });

    const write = _debounce(async (text: string) => {
        await STORAGE_USER.setItem(file, text);

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
