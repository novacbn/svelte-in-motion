<script lang="ts">
    import {Form, NumberInput} from "@kahi-ui/framework";

    import type {TypeNumber, TypePropertySignature} from "@svelte-in-motion/type";
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
    export let type: TypeNumber;
    export let signature: TypePropertySignature;
    export let value: number = 0;

    $: meta = metaAnnotation.getAnnotations(type);
    $: validations = validationAnnotation.getAnnotations(type);

    $: max = resolveValidationLiteral<number>(validations, "maximum");
    $: min = resolveValidationLiteral<number>(validations, "minimum");

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

    <NumberInput
        sizing="nano"
        palette={validates(value, type) ? "affirmative" : "negative"}
        placeholder={placeholder ? $translate(placeholder) : undefined}
        bind:value
        {max}
        {min}
        {readonly}
        {required}
    />

    {#if description}
        <Form.HelpText>
            {$translate(description)}
        </Form.HelpText>
    {/if}
</Form.Control>
