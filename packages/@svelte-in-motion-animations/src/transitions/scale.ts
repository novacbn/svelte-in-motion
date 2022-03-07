import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IScaleParameters extends ITransitionParameters {
    end_x?: number | string;
    start_x?: number | string;

    end_y?: number | string;
    start_y?: number | string;
}

export const scale: ITransition<IScaleParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, end_x = 1, start_x = 0, end_y = 1, start_y = 0} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t) =>
            `transform: scale(calc((${end_x} - ${start_x}) * ${t}), calc((${end_y} - ${start_y}) * ${t}))`,
    };
};
