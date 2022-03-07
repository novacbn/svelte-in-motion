<script lang="ts">
    import {opacity} from "../../transitions/opacity";

    import Transition from "../Transition.svelte";

    type $$Props = {
        element?: HTMLDivElement | HTMLSpanElement | null;

        class?: string;

        is?: "div" | "span";
    } & Parameters<typeof opacity>[1];

    export let element: $$Props["element"] = null;

    let _class: $$Props["class"] = "";
    export {_class as class};

    export let is: $$Props["is"] = undefined;
</script>

<Transition
    bind:element
    class="sim--fade-in {_class}"
    transition={opacity}
    parameters={$$restProps}
    {is}
>
    <slot />
</Transition>
