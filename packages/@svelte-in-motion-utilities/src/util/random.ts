import MersenneTwister from "mersenne-twister";

import {hash_string} from "./string";

export interface IRandomGenerator {
    float(min: number, max: number): number;

    integer(min: number, max: number): number;

    next(): number;
}

export function generate_uint32(): number {
    // NOTE: Proxying incase polyfills or implementation changes are wanted later

    const view = new Uint32Array(1);
    window.crypto.getRandomValues(view);

    return view[0];
}

export function generate_uuid(): string {
    // NOTE: Proxying incase polyfills or implementation changes are wanted later

    return crypto.randomUUID();
}

export function random(seed?: number | string): IRandomGenerator {
    if (typeof seed === "string") seed = hash_string(seed);

    const generator = new MersenneTwister(seed);

    return {
        float(min, max) {
            const difference = (max - min) * generator.random();

            return min + difference;
        },

        integer(min, max) {
            const difference = (max - min) * generator.random();

            return Math.floor(min + difference);
        },

        next() {
            return generator.random();
        },
    };
}
