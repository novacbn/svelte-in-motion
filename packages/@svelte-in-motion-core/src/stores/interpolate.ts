import {StartStopNotifier, Writable} from "svelte/store";
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

    end?: IInterpolateRangeOptions;

    start?: IInterpolateRangeOptions;
}

export function interpolate(
    state: number = 0,
    options: IInterpolateOptions = {},
    callback?: StartStopNotifier<number>
): IInterpolateStore {
    const {easing, end = {}, start = {}} = options;

    const {extrapolate: end_extrapolate = EXTRAPOLATE_MODES.clamp, value: end_value = 1} = end;
    const {extrapolate: start_extrapolate = EXTRAPOLATE_MODES.clamp, value: start_value = 0} =
        start;

    const state_store = writable(state, callback);
    const interpolated_store = derived(state_store, ($state) => {
        if (end_extrapolate === EXTRAPOLATE_MODES.clamp) $state = Math.min($state, 1);
        if (start_extrapolate === EXTRAPOLATE_MODES.clamp) $state = Math.max($state, 0);

        if (easing) $state = easing($state);
        return (end_value - start_value) * $state + start_value;
    });

    return {
        set: state_store.set,
        subscribe: interpolated_store.subscribe,
        update: state_store.update,
    };
}
