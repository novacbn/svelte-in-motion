<script lang="ts">
    import {Button, Card, Form, NumberInput, Stack} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import type {IExportFramesPromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    import {PromptDismissError} from "../../lib/util/errors";

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<IExportFramesPromptEvent>;
    };

    const dispatch = createEventDispatcher();

    export let frame_max: number;
    export let frame_min: number;

    let ending_frame: number = frame_max;
    let starting_frame: number = frame_min;

    function on_close_click(event: MouseEvent): void {
        dispatch("reject", {
            error: PromptDismissError(),
        });
    }

    function on_start_click(event: MouseEvent): void {
        dispatch("resolve", {
            end: ending_frame,
            start: starting_frame,
        });
    }
</script>

<Card.Header>Export Frames</Card.Header>

<Card.Section>
    <Stack.Container spacing="small">
        <Form.Control logic_id="export-video-frame-start">
            <Form.Label>Starting Frame</Form.Label>

            <NumberInput
                min={frame_min}
                max={frame_max}
                sizing="nano"
                bind:value={starting_frame}
            />
        </Form.Control>

        <Form.Control logic_id="export-video-frame-end">
            <Form.Label>Ending Frame</Form.Label>

            <NumberInput min={frame_min} max={frame_max} sizing="nano" bind:value={ending_frame} />
        </Form.Control>
    </Stack.Container>
</Card.Section>

<Card.Footer>
    <Button sizing="nano" variation="clear" palette="inverse" on:click={on_close_click}>
        Close
    </Button>

    <Button sizing="nano" palette="affirmative" on:click={on_start_click}>Start Job</Button>
</Card.Footer>
