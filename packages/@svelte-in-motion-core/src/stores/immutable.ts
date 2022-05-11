import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export type IImmutableStore<T> = Writable<T>;

export function immutable<T>(store: Writable<T> = writable<T>()): IImmutableStore<T> {
    const {set, subscribe, update} = store;

    return {
        set(value) {
            set(structuredClone(value));
        },

        subscribe(callback) {
            return subscribe((value) => {
                callback(structuredClone(value));
            });
        },

        update(updater) {
            update((value) => {
                return updater(structuredClone(value));
            });
        },
    };
}
