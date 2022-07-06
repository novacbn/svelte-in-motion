<script lang="ts">
    import {Form, TextInput} from "@kahi-ui/framework";

    import type {Type} from "@svelte-in-motion/type";

    import {CONTEXT_APP} from "../../lib/app";

    const {translate} = CONTEXT_APP.get()!;

    export let identifier: string = "";
    export let type: Type;
    export let value: string = "";
</script>

<Form.Control logic_id={identifier}>
    <Form.Label>{$translate(`${identifier}-label`)}</Form.Label>

    <TextInput sizing="nano" bind:value />
</Form.Control>
