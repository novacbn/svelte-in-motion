import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IOpacityParameters extends ITransitionParameters {
    rotation?: number | string;
}

export const opacity: ITransition<IOpacityParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t) => `opacity: ${1 * t}`,
    };
};
