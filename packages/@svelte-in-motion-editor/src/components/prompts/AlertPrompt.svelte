<script lang="ts">
    import {Button, Card, Text} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";

    import type {IPromptRejectEvent} from "../../lib/stores/prompts";

    import {CONTEXT_APP} from "../../lib/app";

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;
    };

    const {translations} = CONTEXT_APP.get()!;

    const dispatch = createEventDispatcher();

    export let text: string;

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }
</script>

<Card.Section>
    <Text>
        {$translations.format(text)}
    </Text>
</Card.Section>

<Card.Footer alignment_x="stretch">
    <Button sizing="nano" variation="clear" on:click={on_dismiss_click}>
        {$translations.format("prompts-alert-dismiss-label")}
    </Button>
</Card.Footer>
