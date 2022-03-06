import {Writable} from "svelte/store";
import {derived, writable} from "svelte/store";
import type {EasingFunction} from "svelte/types/runtime/transition";

export enum EXTRAPOLATE_MODES {
    clamp = "clamp",

    extend = "extend",
}

export type IExtrapolateModesLiteral = `${EXTRAPOLATE_MODES}`;

export type IInterpolateStore = Writable<number>;

export interface IInterpolateRangeOptions {
    extrapolate?: IExtrapolateModesLiteral;

    value?: number;
}

export interface IInterpolateOptions {
    easing?: EasingFunction;

    max?: IInterpolateRangeOptions;

    min?: IInterpolateRangeOptions;
}

export function interpolate(
    state: number = 0,
    options: IInterpolateOptions = {}
): IInterpolateStore {
    const {easing, max = {}, min = {}} = options;
    const {extrapolate: max_extrapolate = EXTRAPOLATE_MODES.clamp, value: max_value = 1} = max;
    const {extrapolate: min_extrapolate = EXTRAPOLATE_MODES.clamp, value: min_value = 0} = min;

    const state_store = writable(state);
    const interpolated_store = derived(state_store, ($state) => {
        let value = (max_value - min_value) * $state + min_value;
        if (easing) value = easing(value);

        if (max_extrapolate === EXTRAPOLATE_MODES.clamp) value = Math.min(value, max_value);
        if (min_extrapolate === EXTRAPOLATE_MODES.clamp) value = Math.max(value, min_value);

        return value;
    });

    return {
        set: state_store.set,
        subscribe: interpolated_store.subscribe,
        update: state_store.update,
    };
}
