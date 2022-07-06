<script lang="ts">
    import {Form, TextInput} from "@kahi-ui/framework";

    import type {TypePropertySignature, TypeString} from "@svelte-in-motion/type";
    import {
        metaAnnotation,
        resolveMetaLiteral,
        resolveValidationLiteral,
        validationAnnotation,
        validates,
    } from "@svelte-in-motion/type";

    import {CONTEXT_APP} from "../../lib/app";

    const {translate} = CONTEXT_APP.get()!;

    export let identifier: string;
    export let type: TypeString;
    export let signature: TypePropertySignature;
    export let value: string = "";

    $: meta = metaAnnotation.getAnnotations(type);
    $: validations = validationAnnotation.getAnnotations(type);

    $: max = resolveValidationLiteral<number>(validations, "maxLength");
    $: min = resolveValidationLiteral<number>(validations, "minLength");

    $: pattern = resolveValidationLiteral<RegExp>(validations, "pattern");

    $: required = !signature.optional;
    $: readonly = signature.readonly;

    $: description = resolveMetaLiteral<string>(meta, "description");
    $: label = resolveMetaLiteral<string>(meta, "label");
    $: placeholder = resolveMetaLiteral<string>(meta, "placeholder");
</script>

<Form.Control logic_id={identifier}>
    {#if label}
        <Form.Label>{$translate(label)}</Form.Label>
    {/if}

    <TextInput
        sizing="nano"
        palette={validates(value, type) ? "affirmative" : "negative"}
        mask={!!pattern}
        placeholder={placeholder ? $translate(placeholder) : undefined}
        bind:value
        {max}
        {min}
        {pattern}
        {readonly}
        {required}
    />

    {#if description}
        <Form.HelpText>
            {$translate(description)}
        </Form.HelpText>
    {/if}
</Form.Control>
