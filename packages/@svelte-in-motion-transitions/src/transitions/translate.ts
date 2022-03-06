import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "../transitions/transitions";

export interface ITranslateParameters extends ITransitionParameters {
    units_x?: string;

    units_y?: string;
}

export const translate: ITransition<ITranslateParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, units_x = "0px", units_y = "0px"} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `transform: translate(calc(${units_x} * ${u}), calc(${units_y} * ${u}))`,
    };
};
