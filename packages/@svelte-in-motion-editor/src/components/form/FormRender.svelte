<script lang="ts" context="module">
    import FormNumber from "./FormNumber.svelte";
    import FormString from "./FormString.svelte";

    // HACK: Have to redeclare here since build tools aren't picking up the constant
    // enum definitions from DeepKit

    const ReflectionKind = {
        never: 0,
        any: 1,
        unknown: 2,
        void: 3,
        object: 4,
        string: 5,
        number: 6,
        boolean: 7,
        symbol: 8,
        bigint: 9,
        null: 10,
        undefined: 11,
        regexp: 12,
        literal: 13,
        templateLiteral: 14,
        property: 15,
        method: 16,
        function: 17,
        parameter: 18,
        promise: 19,
        /**
         * Uint8Array, Date, custom classes, Set, Map, etc
         */
        class: 20,
        typeParameter: 21,
        enum: 22,
        union: 23,
        intersection: 24,
        array: 25,
        tuple: 26,
        tupleMember: 27,
        enumMember: 28,
        rest: 29,
        objectLiteral: 30,
        indexSignature: 31,
        propertySignature: 32,
        methodSignature: 33,
        infer: 34,
    };

    const COMPONENT_KIND = {
        [ReflectionKind.number]: FormNumber,
        //[ReflectionKind.string]: FormString,
    };
</script>

<script lang="ts">
    import {format_dash_case} from "@svelte-in-motion/utilities";
    import type {
        TypeLiteral,
        TypeObjectLiteral,
        TypePropertySignature,
    } from "@svelte-in-motion/type";
    import {metaAnnotation} from "@svelte-in-motion/type";

    type IFormType = $$Generic<TypeObjectLiteral>;

    type IFormModel = Record<string, any>;

    export let prefix: string = "";
    export let type: IFormType;

    if (type.kind !== ReflectionKind.objectLiteral) {
        throw new TypeError("bad attribute 'FormRender.type' (expected interface)");
    }

    const class_identifier = prefix + format_dash_case(type.typeName!);

    const signatures = type.types.filter(
        (type) => type.kind === ReflectionKind.propertySignature
    ) as TypePropertySignature[];

    export let model: IFormModel = {};

    const defaults = signatures.map((signature) => {
        const meta = metaAnnotation.getAnnotations(signature.type);
        const default_annotation = meta.find((annotation) => annotation.name === "default");

        if (default_annotation) {
            const default_value = (default_annotation.options[0] as TypeLiteral).literal;

            return [signature.name, default_value];
        }

        return [signature.name, undefined];
    }) as [string, any];

    for (const [key, default_value] of defaults) {
        if (!(key in model)) model[key] = default_value;
    }

    model = model;
</script>

{#each signatures as signature (signature.name)}
    {@const Component = COMPONENT_KIND[signature.type.kind]}

    {#if Component}
        <svelte:component
            this={Component}
            identifier="{class_identifier}-{format_dash_case(signature.name.toString())}"
            type={signature.type}
            {signature}
            bind:value={model[signature.name.toString()]}
        />
    {/if}
{/each}
