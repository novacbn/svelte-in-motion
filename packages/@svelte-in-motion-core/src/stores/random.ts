import type {Readable} from "svelte/store";
import {derived} from "svelte/store";
import MersenneTwister from "mersenne-twister";
import stringHash from "string-hash";

import {CONTEXT_FRAME} from "./frame";

const DEFAULT_SEED = "svelte-in-motion";

export type IRandomStore = Readable<number>;

export interface IRandomOptions {
    seed?: string;
}

export interface IRandomRangeOptions extends IRandomOptions {
    end: number;

    start: number;
}

export function random(options: IRandomOptions = {}): IRandomStore {
    const {seed = DEFAULT_SEED} = options;
    const frame = CONTEXT_FRAME.get()!;

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
