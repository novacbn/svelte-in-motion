<script lang="ts">
    import {Card, Overlay} from "@kahi-ui/framework";

    import type {IPromptRejectEvent, IPromptResolveEvent} from "../../lib/stores/prompts";
    import {EVENT_PROMPT, prompts} from "../../lib/stores/prompts";

    let logic_state: boolean = false;

    function on_reject(event: CustomEvent<IPromptRejectEvent>): void {
        prompts.EVENT_REJECT.dispatch(event.detail);

        logic_state = false;
    }

    function on_resolve(event: CustomEvent<IPromptResolveEvent<any>>): void {
        prompts.EVENT_RESOLVE.dispatch(event.detail);

        logic_state = false;
    }

    // HACK: Svelte's first subscription listen of the `event` will always be undefined
    $: if ($EVENT_PROMPT) logic_state = true;
</script>

<Overlay.Container class="app-prompts" logic_id="app-prompts" bind:logic_state>
    <Overlay.Backdrop />

    <Overlay.Section>
        {#if $prompts}
            <Card.Container sizing="nano" max_size="75">
                <svelte:component
                    this={$prompts.Component}
                    {...$prompts.props ?? {}}
                    on:reject={on_reject}
                    on:resolve={on_resolve}
                />
            </Card.Container>
        {/if}
    </Overlay.Section>
</Overlay.Container>
