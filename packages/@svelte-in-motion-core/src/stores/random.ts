import type {Readable} from "svelte/store";
import {derived} from "svelte/store";
import MersenneTwister from "mersenne-twister";
import stringHash from "string-hash";

import type {ReadableOnly} from "@svelte-in-motion/utilities";

import type {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";

const DEFAULT_SEED = "svelte-in-motion";

export type IRandomStore = Readable<number>;

export interface IRandomOptions {
    frame: ReadableOnly<IFrameStore>;

    seed?: string;
}

export interface IRandomRangeOptions extends IRandomOptions {
    end: number;

    start: number;
}

export const CONTEXT_RANDOM = {
    has() {
        return CONTEXT_FRAME.has();
    },

    get(options: Omit<IRandomOptions, "frame">) {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_RANDOM.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        return random({...options, frame});
    },
};

export const CONTEXT_RANDOM_FLOAT = {
    has() {
        return CONTEXT_FRAME.has();
    },

    get(options: Omit<IRandomRangeOptions, "frame">) {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_RANDOM_FLOAT.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        return random_float({...options, frame});
    },
};

export const CONTEXT_RANDOM_INTEGER = {
    has() {
        return CONTEXT_FRAME.has();
    },

    get(options: Omit<IRandomRangeOptions, "frame">) {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_RANDOM_FLOAT.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        return random_integer({...options, frame});
    },
};

export function random(options: IRandomOptions): IRandomStore {
    const {frame, seed = DEFAULT_SEED} = options;

    return derived(frame, ($frame) => {
        const hash = stringHash(`${seed}${$frame}`);
        const random = new MersenneTwister(hash);

        return random.random();
    });
}

export function random_float(options: IRandomRangeOptions): IRandomStore {
    const {end, start} = options;

    const store = random(options);
    const difference = end - start;

    return derived(store, ($store) => difference * $store);
}

export function random_integer(options: IRandomRangeOptions): IRandomStore {
    const {end, start} = options;

    const store = random(options);
    const difference = Math.floor(end - start);

    return derived(store, ($store) => Math.floor(difference * $store));
}
