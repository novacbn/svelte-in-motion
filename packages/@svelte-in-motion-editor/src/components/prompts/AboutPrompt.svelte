<script lang="ts">
    import {Anchor, Button, Card, Code, Text} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";

    import type {IPromptRejectEvent} from "../../lib/stores/prompts";

    import {APPLICATION_VERSION} from "../../lib/util/constants";

    import {CONTEXT_APP} from "../../lib/app";

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;
    };

    const {translations} = CONTEXT_APP.get()!;

    const dispatch = createEventDispatcher();

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }
</script>

<Card.Section>
    <Text>
        <Text is="strong">
            {$translations.format("ui-prompt-about-version-label")}
        </Text>

        <Code>v{APPLICATION_VERSION}</Code>
    </Text>

    <Text>
        <Text is="strong">
            {$translations.format("ui-prompt-about-source-label")}
        </Text>

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
    <Button sizing="nano" variation="clear" on:click={on_dismiss_click}>
        {$translations.format("ui-prompt-about-dismiss-label")}
    </Button>
</Card.Footer>
