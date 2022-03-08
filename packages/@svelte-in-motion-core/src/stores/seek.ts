import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";
import type {IFrameRateStore} from "./framerate";
import {CONTEXT_FRAMERATE} from "./framerate";
import type {IMaxFramesStore} from "./maxframes";
import {CONTEXT_MAXFRAMES} from "./maxframes";
import type {ReadableOnly} from "./util";

export type ISeekStore = Readable<number>;

export interface ISeekOptions {
    frame: ReadableOnly<IFrameStore>;

    framerate: ReadableOnly<IFrameRateStore>;

    maxframes: ReadableOnly<IMaxFramesStore>;
}

export const CONTEXT_SEEK = {
    has() {
        return CONTEXT_FRAME.has() && CONTEXT_MAXFRAMES.has();
    },

    get() {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_SEEK.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        const framerate = CONTEXT_FRAMERATE.get();
        if (!framerate) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_SEEK.get' (context 'CONTEXT_FRAMERATE' not available)`
            );
        }

        const maxframes = CONTEXT_MAXFRAMES.get();
        if (!maxframes) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_SEEK.get' (contect 'CONTEXT_MAXFRAMES' not available)`
            );
        }

        return seek({frame, framerate, maxframes});
    },
};

export function seek(options: ISeekOptions): ISeekStore {
    const {frame, framerate, maxframes} = options;

    return derived(
        [frame, framerate, maxframes],
        ([$frame, $framerate, $maxframes]) => ($frame / $maxframes) * ($maxframes / $framerate)
    );
}
