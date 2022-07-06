<script lang="ts">
    import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
    import {DataSelect, Form} from "@kahi-ui/framework";

    import type {TypeLiteral, TypePropertySignature, TypeUnion} from "@svelte-in-motion/type";
    import {metaAnnotation, resolveMetaLiteral, validates} from "@svelte-in-motion/type";
    import {format_dash_case, replace_tokens} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";

    import {ReflectionKind} from "./FormRender.svelte";

    const {translate} = CONTEXT_APP.get()!;

    export let identifier: string;
    export let type: TypeUnion;
    export let signature: TypePropertySignature;
    export let value: string = "";

    $: meta = metaAnnotation.getAnnotations(type);

    $: namespace = resolveMetaLiteral<string>(meta, "namespace");

    $: items = (
        type.types.filter((type) => type.kind === ReflectionKind.literal) as TypeLiteral[]
    ).map((type) => {
        if (namespace) {
            const identifier = format_dash_case(type.literal as string);
            const translation = replace_tokens(namespace, {identifier});

            return {
                text: $translate(translation),
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

    $: description = resolveMetaLiteral<string>(meta, "description");
    $: label = resolveMetaLiteral<string>(meta, "label");
    $: placeholder = resolveMetaLiteral<string>(meta, "placeholder");
</script>

<Form.Control logic_id={identifier}>
    {#if label}
        <Form.Label>{$translate(label)}</Form.Label>
    {/if}

    <DataSelect
        sizing="nano"
        logic_name={identifier}
        placeholder={placeholder ? $translate(placeholder) : undefined}
        {items}
        bind:logic_state={value}
    />

    {#if description}
        <Form.HelpText>
            {$translate(description)}
        </Form.HelpText>
    {/if}
</Form.Control>
