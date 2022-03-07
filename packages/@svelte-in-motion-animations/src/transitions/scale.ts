import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IScaleParameters extends ITransitionParameters {
    max_x?: number | string;
    min_x?: number | string;

    max_y?: number | string;
    min_y?: number | string;
}

export const scale: ITransition<IScaleParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, max_x = 1, min_x = 0, max_y = 1, min_y = 0} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t) =>
            `transform: scale(calc((${max_x} - ${min_x}) * ${t}), calc((${max_y} - ${min_y}) * ${t}))`,
    };
};
