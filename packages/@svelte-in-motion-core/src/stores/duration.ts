import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {ReadableOnly} from "@svelte-in-motion/utilities";

import type {IFrameRateStore} from "./framerate";
import {CONTEXT_FRAMERATE} from "./framerate";
import type {IMaxFramesStore} from "./maxframes";
import {CONTEXT_MAXFRAMES} from "./maxframes";

export type IDurationStore = Readable<number>;

export interface IDurationOptions {
    framerate: ReadableOnly<IFrameRateStore>;

    maxframes: ReadableOnly<IMaxFramesStore>;
}

export const CONTEXT_DURATION = {
    has() {
        return CONTEXT_FRAMERATE.has() && CONTEXT_MAXFRAMES.has();
    },

    get() {
        const framerate = CONTEXT_FRAMERATE.get();
        if (!framerate) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_DURATION.get' (context 'CONTEXT_FRAMERATE' not available)`
            );
        }

        const maxframes = CONTEXT_MAXFRAMES.get();
        if (!maxframes) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_DURATION.get' (contect 'CONTEXT_MAXFRAMES' not available)`
            );
        }

        return duration({framerate, maxframes});
    },
};

export function duration(options: IDurationOptions): IDurationStore {
    const {framerate, maxframes} = options;

    return derived([framerate, maxframes], ([$framerate, $maxframes]) => $maxframes / $framerate);
}
