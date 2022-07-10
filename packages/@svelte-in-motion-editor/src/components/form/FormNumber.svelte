<script lang="ts">
    import {Form, NumberInput} from "@kahi-ui/framework";

    import type {TypeNumber, TypePropertySignature} from "@svelte-in-motion/type";
    import {
        resolveValidationLiteral,
        validationAnnotation,
        validates,
    } from "@svelte-in-motion/type";
    import {format_dash_case, format_snake_case} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";

    const {translations} = CONTEXT_APP.get()!;

    export let namespace: string;
    export let signature: TypePropertySignature;
    export let type: TypeNumber;
    export let value: number = 0;

    $: form_identifier = `prompts-${format_dash_case(namespace)}-${format_dash_case(
        signature.name.toString()
    )}`;
    $: translation_identifier = `prompts-${format_snake_case(namespace)}-${format_snake_case(
        signature.name.toString()
    )}`;

    $: description = `${translation_identifier}-description`;
    $: label = `${translation_identifier}-label`;
    $: placeholder = `${translation_identifier}-placeholder`;

    $: validations = validationAnnotation.getAnnotations(type);

    $: max = resolveValidationLiteral<number>(validations, "maximum");
    $: min = resolveValidationLiteral<number>(validations, "minimum");

    $: required = !signature.optional;
    $: readonly = signature.readonly;

    $: is_valid = validates(value, type);
</script>

<Form.Control logic_id={form_identifier}>
    {#if $translations.has(label)}
        <Form.Label>{$translations.format(label)}</Form.Label>
    {/if}

    <NumberInput
        sizing="nano"
        palette={is_valid ? "affirmative" : "negative"}
        placeholder={$translations.has(placeholder) ? $translations.format(placeholder) : undefined}
        bind:value
        {max}
        {min}
        {readonly}
        {required}
    />

    {#if $translations.has(description)}
        <Form.HelpText>
            {$translations.format(description)}
        </Form.HelpText>
    {/if}
</Form.Control>
