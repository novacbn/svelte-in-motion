import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IScaleParameters extends ITransitionParameters {
    units_x?: number | string;

    units_y?: number | string;
}

export const scale: ITransition<IScaleParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, units_x = 1, units_y = 1} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t) => `transform: scale(calc(${units_x} * ${t}), calc(${units_y} * ${t}))`,
    };
};
