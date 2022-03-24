<script lang="ts">
    import {CONTEXT_FRAME, CONTEXT_FRAMERATE} from "@svelte-in-motion/core";

    import {transition as transition_action} from "../actions/transition";
    import type {ITransition} from "../transitions/transitions";

    type ITransitionInit = $$Generic<ITransition>;

    type ITransitionParameters = Parameters<ITransitionInit>[1];

    type $$Props = {
        element?: HTMLDivElement | HTMLSpanElement | null;

        class?: string;

        is?: "div" | "span";

        transition: ITransitionInit;

        inverse?: boolean;
        parameters?: ITransitionParameters;
    };

    export let element: $$Props["element"] = null;

    let _class: $$Props["class"] = "";
    export {_class as class};

    export let is: $$Props["is"] = undefined;

    export let transition: $$Props["transition"];

    export let inverse: $$Props["inverse"] = undefined;
    export let parameters: $$Props["parameters"] = {};
</script>

{#if is === "span"}
    <span
        bind:this={element}
        class="sim--transition {_class}"
        use:transition_action={{
            transition,
            inverse,
            parameters: parameters ?? {},
        }}
    >
        <slot />
    </span>
{:else}
    <div
        bind:this={element}
        class="sim--transition {_class}"
        use:transition_action={{
            transition,
            inverse,
            parameters: parameters ?? {},
        }}
    >
        <slot />
    </div>
{/if}
