import type {IFrameRateStore, IFrameStore} from "@svelte-in-motion/core";
import {state} from "@svelte-in-motion/core";

import type {ITransition} from "../transitions/transitions";

import type {IAction, IActionHandle} from "./actions";

export type ITransitionAction<T extends ITransition> = IAction<
    HTMLElement,
    ITransitionActionOptions<T>,
    ITransitionActionHandle<T>
>;

export type ITransitionActionHandle<T extends ITransition> = IActionHandle<
    ITransitionActionOptions<T>
>;

export interface ITransitionActionOptions<T extends ITransition> {
    frame: IFrameStore;

    framerate: IFrameRateStore;

    inverse?: boolean;

    parameters: Parameters<T>[1];

    transition: T;
}

export function transition<T extends ITransition>(
    element: HTMLElement,
    options: ITransitionActionOptions<T>
): ITransitionActionHandle<T> {
    let destroy: (() => void) | null = null;

    function update(options: ITransitionActionOptions<T>): void {
        if (destroy) {
            destroy();
            destroy = null;
        }

        const {frame, framerate, inverse, parameters = {}, transition} = options;
        const {css, delay, duration, easing, tick} = {
            ...parameters,
            ...transition(element, parameters),
        };

        const store = state({
            delay,
            duration,
            easing,
            frame,
            framerate,
        });

        destroy = store.subscribe((state) => {
            if (typeof state === "number") {
                const in_tick = inverse ? 1 - state : state;
                const out_tick = inverse ? state : 1 - state;

                // TODO: cycle through every CSS step ahead of time to generate
                // a `@keyframes` animation like Svelte to have the engine handle it
                if (css) element.style.cssText = css(in_tick, out_tick);
                if (tick) tick(in_tick, out_tick);
            }
        });
    }

    update(options);

    return {
        destroy() {
            if (destroy) destroy();
        },

        update(options) {
            update(options);
        },
    };
}
