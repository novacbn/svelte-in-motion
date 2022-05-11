import {CONTEXT_FRAME, CONTEXT_FRAMERATE, state} from "@svelte-in-motion/core";
import {parse_style} from "@svelte-in-motion/utilities";

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

export type ITransitionActionOptions<T extends ITransition> = {
    inverse?: boolean;

    transition: T;
} & T;

export function transition<T extends ITransition>(
    element: HTMLElement,
    options: ITransitionActionOptions<T>
): ITransitionActionHandle<T> {
    const frame = CONTEXT_FRAME.get();
    if (!frame) {
        throw new ReferenceError(
            `bad dispatch to 'transition' (context 'CONTEXT_FRAME' not available)`
        );
    }

    const framerate = CONTEXT_FRAMERATE.get();
    if (!framerate) {
        throw new ReferenceError(
            `bad dispatch to 'transition' (context 'CONTEXT_FRAMERATE' not available)`
        );
    }

    let destroy: (() => void) | null = null;

    function update(options: ITransitionActionOptions<T>): void {
        if (destroy) {
            destroy();
            destroy = null;
        }

        const {inverse, transition, ...parameters} = options;
        const {css, delay, duration, easing, tick} = {
            ...parameters,
            ...transition(element, parameters),
        };

        const store = state({
            delay,
            duration,
            easing,
            // @ts-expect-error - HACK: TypeScript doesn't understand that the upper
            // scope already validated the Stores were not `undefined`
            frame,
            // @ts-expect-error
            framerate,
        });

        destroy = store.subscribe((state) => {
            if (typeof state === "number") {
                const in_tick = inverse ? 1 - state : state;
                const out_tick = inverse ? state : 1 - state;

                if (css) {
                    const style = css(in_tick, out_tick);
                    const declarations = parse_style(style);

                    Object.assign(element.style, declarations);
                }
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
