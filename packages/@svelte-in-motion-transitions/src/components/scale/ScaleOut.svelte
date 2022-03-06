<script lang="ts">
    import {scale} from "../../transitions/scale";

    import Transition from "../Transition.svelte";

    type $$Props = {
        element?: HTMLDivElement | HTMLSpanElement | null;

        class?: string;

        is?: "div" | "span";
    } & Parameters<typeof scale>[1];

    export let element: $$Props["element"] = null;

    let _class: $$Props["class"] = "";
    export {_class as class};

    export let is: $$Props["is"] = undefined;
</script>

<Transition
    bind:element
    class="sim--scale-out {_class}"
    transition={scale}
    parameters={$$restProps}
    {is}
    inverse
>
    <slot />
</Transition>
