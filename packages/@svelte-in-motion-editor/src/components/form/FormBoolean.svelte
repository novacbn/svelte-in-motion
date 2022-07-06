<script lang="ts">
    import {Form, Spacer, Stack, Switch} from "@kahi-ui/framework";

    import type {TypeBoolean, TypePropertySignature} from "@svelte-in-motion/type";
    import {metaAnnotation, resolveMetaLiteral} from "@svelte-in-motion/type";

    import {CONTEXT_APP} from "../../lib/app";

    const {translate} = CONTEXT_APP.get()!;

    export let identifier: string;
    export let type: TypeBoolean;
    export let signature: TypePropertySignature;
    export let value: boolean = false;

    $: meta = metaAnnotation.getAnnotations(type);

    $: description = resolveMetaLiteral<string>(meta, "description");
    $: label = resolveMetaLiteral<string>(meta, "label");
</script>

<Form.Group logic_id={identifier}>
    <Stack.Container orientation="horizontal" alignment_y="center" spacing="small">
        {#if description || label}
            <Stack.Container spacing="tiny">
                {#if label}
                    <Form.Label>{$translate(label)}</Form.Label>
                {/if}

                {#if description}
                    <Form.HelpText>
                        {$translate(description)}
                    </Form.HelpText>
                {/if}
            </Stack.Container>
        {/if}

        <Spacer />
        <Switch sizing="small" palette="affirmative" bind:state={value} />
    </Stack.Container>
</Form.Group>
