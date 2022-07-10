<script lang="ts">
    import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
    import {DataSelect, Form} from "@kahi-ui/framework";

    import type {TypeLiteral, TypePropertySignature, TypeUnion} from "@svelte-in-motion/type";
    import {validates} from "@svelte-in-motion/type";
    import {format_dash_case, format_snake_case} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";

    import {ReflectionKind} from "./FormRender.svelte";

    const {translations} = CONTEXT_APP.get()!;

    export let namespace: string;
    export let signature: TypePropertySignature;
    export let type: TypeUnion;
    export let value: string = "";

    $: form_identifier = `prompts-${format_dash_case(namespace)}-${format_dash_case(
        signature.name.toString()
    )}`;
    $: translation_identifier = `prompts-${format_snake_case(namespace)}-${format_snake_case(
        signature.name.toString()
    )}`;

    $: description = `${translation_identifier}-description`;
    $: label = `${translation_identifier}-label`;
    $: placeholder = `${translation_identifier}-placeholder`;

    $: items = (
        type.types.filter((type) => type.kind === ReflectionKind.literal) as TypeLiteral[]
    ).map((type) => {
        const type_identifier = `${translation_identifier}-${format_dash_case(
            type.literal as string
        )}-label`;

        if ($translations.has(type_identifier)) {
            return {
                text: $translations.format(type_identifier),
                id: type.literal as string,
                palette: "accent" as PROPERTY_PALETTE,
            };
        }

        return {
            text: type.literal as string,
            id: type.literal as string,
            palette: "accent" as PROPERTY_PALETTE,
        };
    });

    $: is_valid = validates(value, type);
</script>

<Form.Control logic_id={form_identifier}>
    {#if $translations.has(label)}
        <Form.Label>{$translations.format(label)}</Form.Label>
    {/if}

    <DataSelect
        sizing="nano"
        palette={is_valid ? "affirmative" : "negative"}
        logic_name={form_identifier}
        placeholder={$translations.has(placeholder) ? $translations.format(placeholder) : undefined}
        {items}
        bind:logic_state={value}
    />

    {#if $translations.has(description)}
        <Form.HelpText>
            {$translations.format(description)}
        </Form.HelpText>
    {/if}
</Form.Control>
