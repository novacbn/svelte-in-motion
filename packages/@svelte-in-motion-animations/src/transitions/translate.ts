import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "../transitions/transitions";

export interface ITranslateParameters extends ITransitionParameters {
    end_x?: number | string;
    start_x?: number | string;

    end_y?: number | string;
    start_y?: number | string;
}

export const translate: ITransition<ITranslateParameters> = (
    element,
    {
        delay = 0,
        duration = 0,
        easing = linear,
        end_x = "0px",
        start_x = "0px",
        end_y = "0px",
        start_y = "0px",
    } = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t, u) =>
            `transform: translate(calc((${end_x} - ${start_x}) * ${u}), calc((${end_y} - ${start_y}) * ${u}))`,
    };
};
