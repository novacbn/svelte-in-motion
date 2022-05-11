import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {ReadableOnly} from "@svelte-in-motion/utilities";
import {random as make_random_generator} from "@svelte-in-motion/utilities";

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
        const random = make_random_generator(`${seed}${$frame}`);

        return random.next();
    });
}

export function random_float(options: IRandomRangeOptions): IRandomStore {
    const {end, frame, seed = DEFAULT_SEED, start} = options;

    return derived(frame, ($frame) => {
        const random = make_random_generator(`${seed}${$frame}`);

        return random.float(start, end);
    });
}

export function random_integer(options: IRandomRangeOptions): IRandomStore {
    const {end, frame, seed = DEFAULT_SEED, start} = options;

    return derived(frame, ($frame) => {
        const random = make_random_generator(`${seed}${$frame}`);

        return random.integer(start, end);
    });
}
