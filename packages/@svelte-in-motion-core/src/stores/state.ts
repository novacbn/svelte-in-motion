import {Readable} from "svelte/store";
import {derived} from "svelte/store";

import {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";
import {IFrameRateStore} from "./framerate";
import {CONTEXT_FRAMERATE} from "./framerate";
import type {IInterpolateOptions} from "./interpolate";
import {interpolate} from "./interpolate";

export type IStateStore = Readable<number>;

export interface IStateOptions extends IInterpolateOptions {
    delay?: number;

    duration?: number;

    frame: IFrameStore;

    framerate: IFrameRateStore;
}

export const CONTEXT_STATE = {
    has() {
        return CONTEXT_FRAME.has() && CONTEXT_FRAMERATE.has();
    },

    get(options: Omit<IStateOptions, "frame" | "framerate"> = {}) {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_STATE.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        const framerate = CONTEXT_FRAMERATE.get();
        if (!framerate) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_STATE.get' (context 'CONTEXT_FRAMERATE' not available)`
            );
        }

        return state({...options, frame, framerate});
    },
};

export function state(options: IStateOptions): IStateStore {
    const {delay = 0, duration = 0, frame, framerate, ...extended_options} = options;

    return interpolate(0, extended_options, (set) => {
        const destroy = derived([frame, framerate], ([$frame, $framerate]) => {
            const _delay = delay * $framerate;
            const _duration = duration * $framerate;

            return ($frame - _delay) / _duration;
        }).subscribe((state) => set(state));

        return () => destroy();
    });
}
