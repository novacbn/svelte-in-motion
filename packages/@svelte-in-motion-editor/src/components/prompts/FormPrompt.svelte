<script lang="ts">
    import {Button, Card, Form, Stack, TextInput} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError, format_dash_case} from "@svelte-in-motion/utilities";
    import type {ReflectionClass} from "@svelte-in-motion/type";
    import {ReflectionKind} from "@svelte-in-motion/type";

    import type {IFormPromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    import {CONTEXT_APP} from "../../lib/app";

    const {prompts, translate} = CONTEXT_APP.get()!;

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<IFormPromptEvent<unknown>>;
    };

    const dispatch = createEventDispatcher();

    export let reflection: ReflectionClass<unknown>;

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_submit_click(event: MouseEvent): void {
        /*dispatch("resolve", {
           
        });*/
    }

    const class_identifier = `ui-prompt-form-${format_dash_case(reflection.getClassName())}`;

    const properties = reflection.getProperties().map((property) => {
        const name = property.getNameAsString();
        const identifier = `${class_identifier}-${format_dash_case(name)}`;

        return {
            name,
            identifier,
            metadata: property,
        };
    });

    const model = Object.fromEntries(
        properties.map((property) => {
            const {metadata, name} = property;

            return [name, metadata.getDefaultValue()];
        })
    );

    console.log({model});
    console.log({reflection});
</script>

<Card.Section>
    <Stack.Container spacing="small">
        {#each properties as property (property.name)}
            <Form.Control logic_id={property.identifier}>
                <Form.Label>{$translate(`${property.identifier}-label`)}</Form.Label>

                <TextInput sizing="nano" bind:value={model[property.name]} />
            </Form.Control>
        {/each}
    </Stack.Container>
</Card.Section>
