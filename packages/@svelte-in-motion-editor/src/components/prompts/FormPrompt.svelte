<script lang="ts">
    import {Button, Card, Form, Stack} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";
    import type {TypeObjectLiteral} from "@svelte-in-motion/type";
    import {validates} from "@svelte-in-motion/type";

    import type {IFormPromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    import {CONTEXT_APP} from "../../lib/app";

    import FormRender from "../form/FormRender.svelte";

    const {prompts, translate} = CONTEXT_APP.get()!;

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<IFormPromptEvent<unknown>>;
    };

    const dispatch = createEventDispatcher();

    export let model: any;
    export let type: TypeObjectLiteral;

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_submit(event: MouseEvent | SubmitEvent): void {
        event.preventDefault();
        if (!validates(model, type)) return;

        dispatch("resolve", {
            model,
        });
    }
</script>

<Card.Section>
    <form on:submit={on_submit}>
        <Stack.Container spacing="small">
            <FormRender {type} bind:model />
        </Stack.Container>

        <input type="submit" data-hidden />
    </form>
</Card.Section>

<Card.Footer alignment_x="stretch">
    {#if $prompts?.is_dismissible}
        <Button sizing="nano" variation="clear" on:click={on_dismiss_click}>
            {$translate("ui-prompt-dismiss-label")}
        </Button>
    {/if}

    <Button
        sizing="nano"
        variation="clear"
        palette="affirmative"
        disabled={!validates(model, type)}
        on:click={on_submit}
    >
        {$translate("ui-prompt-form-submit-label")}
    </Button>
</Card.Footer>
