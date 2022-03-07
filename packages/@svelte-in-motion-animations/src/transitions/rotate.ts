import {linear} from "svelte/easing";

import type {ITransition, ITransitionParameters} from "./transitions";

export interface IRotateParameters extends ITransitionParameters {
    rotation?: number | string;
}

export const rotate: ITransition<IRotateParameters> = (
    element,
    {delay = 0, duration = 0, easing = linear, rotation = "0deg"} = {}
) => {
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `transform: rotate(calc(${rotation} * ${u}))`,
    };
};
