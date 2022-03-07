import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IOpacityParameters extends ITransitionParameters {
    end?: number | string;

    start?: number | string;
}

export const opacity: ITransition<IOpacityParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, end = 1, start = 0} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t) => `opacity: calc((${end} - ${start}) * ${t})`,
    };
};
