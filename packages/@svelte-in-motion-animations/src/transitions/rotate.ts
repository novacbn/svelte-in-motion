import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IRotateParameters extends ITransitionParameters {
    max?: number | string;

    min?: number | string;
}

export const rotate: ITransition<IRotateParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, max = "360deg", min = "0deg"} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `transform: rotate(calc((${max} - ${min}) * ${u}))`,
    };
};
