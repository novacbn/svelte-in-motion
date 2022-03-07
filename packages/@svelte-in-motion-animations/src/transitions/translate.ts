import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "../transitions/transitions";

export interface ITranslateParameters extends ITransitionParameters {
    max_x?: number | string;
    min_x?: number | string;

    max_y?: number | string;
    min_y?: number | string;
}

export const translate: ITransition<ITranslateParameters> = (
    element,
    {
        delay = 0,
        duration = 0,
        easing = linear,
        max_x = "0px",
        min_x = "0px",
        max_y = "0px",
        min_y = "0px",
    } = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t, u) =>
            `transform: translate(calc((${max_x} - ${min_x}) * ${u}), calc((${max_y} - ${min_y}) * ${u}))`,
    };
};
