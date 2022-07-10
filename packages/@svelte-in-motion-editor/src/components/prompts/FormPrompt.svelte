<script lang="ts">
    import {Button, Card, Stack} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import type {TypeObjectLiteral} from "@svelte-in-motion/type";
    import {validates} from "@svelte-in-motion/type";
    import {PromptDismissError, format_snake_case} from "@svelte-in-motion/utilities";

    import type {IFormPromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    import {CONTEXT_APP} from "../../lib/app";

    import FormRender from "../form/FormRender.svelte";

    const {prompts, translations} = CONTEXT_APP.get()!;

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<IFormPromptEvent<unknown>>;
    };

    const dispatch = createEventDispatcher();

    export let model: any;
    export let namespace: string;
    export let type: TypeObjectLiteral;

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_submit(event: MouseEvent | SubmitEvent): void {
        event.preventDefault();
        if (!is_valid) return;

        dispatch("resolve", {
            model,
        });
    }

    $: translation_identifier = `prompts-${format_snake_case(type.typeName!)}`;

    $: is_valid = validates(model, type);
</script>

<Card.Section>
    <form on:submit={on_submit}>
        <Stack.Container spacing="small">
            <FormRender {namespace} {type} bind:model />
        </Stack.Container>

        <input type="submit" data-hidden />
    </form>
</Card.Section>

<Card.Footer alignment_x="stretch">
    {#if $prompts?.is_dismissible}
        <Button sizing="nano" variation="clear" on:click={on_dismiss_click}>
            {$translations.format(`${translation_identifier}-dismiss-label`)}
        </Button>
    {/if}

    <Button
        sizing="nano"
        variation="clear"
        palette="affirmative"
        disabled={!is_valid}
        on:click={on_submit}
    >
        {$translations.format(`${translation_identifier}-submit-label`)}
    </Button>
</Card.Footer>
