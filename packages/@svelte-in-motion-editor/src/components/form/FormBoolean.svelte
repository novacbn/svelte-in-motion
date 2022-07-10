<script lang="ts">
    import {Form, Spacer, Stack, Switch} from "@kahi-ui/framework";

    import type {TypeBoolean, TypePropertySignature} from "@svelte-in-motion/type";
    import {format_dash_case, format_snake_case} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";

    const {translations} = CONTEXT_APP.get()!;

    export let namespace: string;
    export let signature: TypePropertySignature;
    export let type: TypeBoolean;
    export let value: boolean = false;

    $: form_identifier = `prompts-${format_dash_case(namespace)}-${format_dash_case(
        signature.name.toString()
    )}`;
    $: translation_identifier = `prompts-${format_snake_case(namespace)}-${format_snake_case(
        signature.name.toString()
    )}`;

    $: description = `${translation_identifier}-description`;
    $: label = `${translation_identifier}-label`;
</script>

<Form.Group logic_id={form_identifier}>
    <Stack.Container orientation="horizontal" alignment_y="center" spacing="small">
        {#if description || label}
            <Stack.Container spacing="tiny">
                {#if $translations.has(label)}
                    <Form.Label>{$translations.format(label)}</Form.Label>
                {/if}

                {#if $translations.has(description)}
                    <Form.HelpText>
                        {$translations.format(description)}
                    </Form.HelpText>
                {/if}
            </Stack.Container>
        {/if}

        <Spacer />
        <Switch sizing="small" palette="affirmative" bind:state={value} />
    </Stack.Container>
</Form.Group>
