import {deleteProperty, getProperty, hasProperty, setProperty} from "dot-prop";
import type {Readable, Writable} from "svelte/store";
import {derived, get} from "svelte/store";

export type IMap = Record<string, any>;

export interface IMapStore<T extends IMap> extends Readable<T> {
    get<V>(path: string): V | undefined;

    has(path: string): boolean;

    set(path: string, value: any): void;

    remove(path: string): void;

    watch<V>(path: string): Readable<V | undefined>;
}

export function map<T extends IMap>(store: Writable<T>): IMapStore<T> {
    const {set, subscribe} = store;

    return {
        subscribe,

        get(path) {
            const $map = get(store);

            return getProperty($map, path);
        },

        has(path) {
            const $map = get(store);

            return hasProperty($map, path);
        },

        set(path, value) {
            const $map = get(store);

            setProperty($map, path, value);
            set($map);
        },

        remove(path) {
            const $map = get(store);

            if (!hasProperty($map, path)) {
                throw new ReferenceError(`bad argument #0 to 'map.remove' (path not valid)`);
            }

            deleteProperty($map, path);
            set($map);
        },

        watch(path) {
            return derived(store, ($map) => {
                return getProperty($map, path);
            });
        },
    };
}
