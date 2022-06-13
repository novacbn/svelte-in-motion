import {getContext, hasContext, setContext} from "svelte";

/**
 * Represents the return value of [[make_scoped_context]]
 */
export interface IContextScope<T> {
    key: string;

    get(): T | undefined;

    has(): boolean;

    set(value: T | undefined): void;
}

/**
 * Returns Svelte Context Scoped helpers
 *
 * ```javascript
 * const {get, has, set} = make_scoped_context("my-context");
 * ```
 *
 * @param key
 * @returns
 */
export function make_scoped_context<T>(key: string): IContextScope<T> {
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
