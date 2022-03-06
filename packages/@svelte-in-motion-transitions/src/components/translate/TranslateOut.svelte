<script lang="ts">
    import {translate} from "../../transitions/translate";

    import Transition from "../Transition.svelte";

    type $$Props = {
        element?: HTMLDivElement | HTMLSpanElement | null;

        class?: string;

        is?: "div" | "span";
    } & Parameters<typeof translate>[1];

    export let element: $$Props["element"] = null;

    let _class: $$Props["class"] = "";
    export {_class as class};

    export let is: $$Props["is"] = undefined;
</script>

<Transition
    bind:element
    class="sim--translate-out {_class}"
    transition={translate}
    parameters={$$restProps}
    {is}
    inverse
>
    <slot />
</Transition>
