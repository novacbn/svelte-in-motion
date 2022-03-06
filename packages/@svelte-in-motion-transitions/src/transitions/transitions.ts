import type {EasingFunction, TransitionConfig} from "svelte/transition";

// NOTE: Aliasing Svelte's built-in types here incase of
// needing changes in the future

export type IEasingFunction = EasingFunction;

export type ITransitionConfig = TransitionConfig;

export type ITransition<T extends ITransitionParameters = ITransitionParameters> = (
    element: HTMLElement,
    parameters: T
) => ITransitionConfig;

export interface ITransitionParameters {
    delay?: number;

    duration?: number;

    easing?: EasingFunction;
}
