import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IOpacityParameters extends ITransitionParameters {
    max?: number | string;

    min?: number | string;
}

export const opacity: ITransition<IOpacityParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, max = 1, min = 0} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t) => `opacity: calc((${max} - ${min}) * ${t})`,
    };
};
