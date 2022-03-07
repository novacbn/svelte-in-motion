<script lang="ts">
    import {rotate} from "../../transitions/rotate";

    import Transition from "../Transition.svelte";

    type $$Props = {
        element?: HTMLDivElement | HTMLSpanElement | null;

        class?: string;

        is?: "div" | "span";
    } & Parameters<typeof rotate>[1];

    export let element: $$Props["element"] = null;

    let _class: $$Props["class"] = "";
    export {_class as class};

    export let is: $$Props["is"] = undefined;
</script>

<Transition
    bind:element
    class="sim--rotate-in {_class}"
    transition={rotate}
    parameters={$$restProps}
    {is}
>
    <slot />
</Transition>
