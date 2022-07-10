<script lang="ts">
    import {Button, Card, Text} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";

    import type {IPromptRejectEvent} from "../../lib/stores/prompts";

    import {CONTEXT_APP} from "../../lib/app";

    type $$Events = {
        resolve: CustomEvent<void>;

        reject: CustomEvent<IPromptRejectEvent>;
    };

    const {translations} = CONTEXT_APP.get()!;

    const dispatch = createEventDispatcher();

    export let namespace: string;

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_submit_click(event: MouseEvent): void {
        dispatch("resolve");
    }
</script>

<Card.Section>
    <Text>
        {$translations.format(`prompts-${namespace}-description`)}
    </Text>
</Card.Section>

<Card.Footer alignment_x="stretch">
    <Button sizing="nano" variation="clear" on:click={on_dismiss_click}>
        {$translations.format("prompts-confirm-dismiss-label")}
    </Button>

    <Button sizing="nano" variation="clear" palette="affirmative" on:click={on_submit_click}>
        {$translations.format("prompts-confirm-submit-label")}
    </Button>
</Card.Footer>
