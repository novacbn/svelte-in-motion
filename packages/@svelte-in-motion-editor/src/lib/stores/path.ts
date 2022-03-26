import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

import {normalize_pathname} from "@svelte-in-motion/core";

export type IPathStore = Writable<string>;

export function path(path: string): IPathStore {
    const {set, subscribe, update} = writable<string>(normalize_pathname(path));

    return {
        subscribe,

        set(path) {
            set(normalize_pathname(path));
        },

        update(callback) {
            update((path) => {
                return normalize_pathname(callback(path));
            });
        },
    };
}
