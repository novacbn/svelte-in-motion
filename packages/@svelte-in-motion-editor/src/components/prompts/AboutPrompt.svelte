<script lang="ts">
    import {Anchor, Button, Card, Code, Text} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";

    import type {IPromptRejectEvent} from "../../lib/stores/prompts";

    import {APPLICATION_VERSION} from "../../lib/util/constants";

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;
    };

    const dispatch = createEventDispatcher();

    function on_close_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }
</script>

<Card.Header>About Svelte-In-Motion</Card.Header>

<Card.Section>
    <Text>
        <Text is="strong">VERSION</Text>
        <Code>v{APPLICATION_VERSION}</Code>
    </Text>

    <Text>
        <Text is="strong">SOURCE</Text>
        <Anchor
            href="https://github.com/novacbn/svelte-in-motion"
            target="_blank"
            rel="noopener noreferrer"
            palette="informative"
        >
            github.com/novacbn/svelte-in-motion
        </Anchor>
    </Text>
</Card.Section>

<Card.Footer alignment_x="stretch">
    <Button sizing="nano" variation="clear" on:click={on_close_click}>Close</Button>
</Card.Footer>
