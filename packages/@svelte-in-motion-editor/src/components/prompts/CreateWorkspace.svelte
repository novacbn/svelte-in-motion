<script lang="ts">
    import {Button, Card, Form, Stack, TextInput} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";

    import type {ICreateWorkspacePromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<ICreateWorkspacePromptEvent>;
    };

    const dispatch = createEventDispatcher();

    let workspace_name: string = "";

    function on_close_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_create_click(event: MouseEvent): void {
        dispatch("resolve", {
            name: workspace_name,
        });
    }
</script>

<Card.Header>Create Workspace</Card.Header>

<Card.Section>
    <Stack.Container spacing="small">
        <!-- TODO: Regex validation -->
        <Form.Control logic_id="create-workspace-name">
            <Form.Label>Name</Form.Label>

            <TextInput sizing="nano" bind:value={workspace_name} />
        </Form.Control>
    </Stack.Container>
</Card.Section>

<Card.Footer alignment_x="stretch">
    <Button sizing="nano" variation="clear" palette="inverse" on:click={on_close_click}>
        Close
    </Button>

    <Button
        sizing="nano"
        variation="clear"
        palette="affirmative"
        disabled={!workspace_name}
        on:click={on_create_click}
    >
        Create Workspace
    </Button>
</Card.Footer>
