import {getContext, hasContext, setContext} from "svelte";

/**
 * Represents the return value of [[make_scoped_context]]
 */
export interface IContextScope<Key, Value> {
    key: Key;

    get(): Value | undefined;

    has(): boolean;

    set(value: Value | undefined): void;
}

/**
 * Returns Svelte Context Scoped helpers
 *
 * @param key
 * @returns
 */
export function make_scoped_context<Value, Key = unknown>(key: Key): IContextScope<Key, Value> {
    return {
        key,

        get() {
            return getContext(key);
        },

        has() {
            return hasContext(key);
        },

        set(value) {
            setContext(key, value);
        },
    };
}
