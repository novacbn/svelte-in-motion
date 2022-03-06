import {Readable} from "svelte/store";
import {derived} from "svelte/store";
import type {EasingFunction} from "svelte/types/runtime/transition";

import {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";
import {IFrameRateStore} from "./framerate";
import {CONTEXT_FRAMERATE} from "./framerate";
import type {IExtrapolateModesLiteral} from "./interpolate";
import {EXTRAPOLATE_MODES} from "./interpolate";

export type IStateStore = Readable<number>;

export interface IStateOptions {
    delay?: number;

    duration?: number;

    easing?: EasingFunction;

    frame: IFrameStore;

    framerate: IFrameRateStore;

    max?: IExtrapolateModesLiteral;

    min?: IExtrapolateModesLiteral;
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
    const {
        delay = 0,
        duration = 0,
        easing,
        frame,
        framerate,
        max = EXTRAPOLATE_MODES.clamp,
        min = EXTRAPOLATE_MODES.clamp,
    } = options;

    return derived([frame, framerate], ([$frame, $framerate]) => {
        const _delay = delay * $framerate;
        const _duration = duration * $framerate;

        let state = ($frame - _delay) / _duration;

        if (max === EXTRAPOLATE_MODES.clamp) state = Math.min(state, 1);
        if (min === EXTRAPOLATE_MODES.clamp) state = Math.max(state, 0);

        return easing ? easing(state) : state;
    });
}
