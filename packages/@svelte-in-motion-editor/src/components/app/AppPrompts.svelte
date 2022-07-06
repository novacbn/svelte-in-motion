<script lang="ts">
    import {Card, Overlay} from "@kahi-ui/framework";

    import {PromptDismissError, idle} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";

    import type {IPromptRejectEvent, IPromptResolveEvent} from "../../lib/stores/prompts";

    const {prompts, translate} = CONTEXT_APP.get()!;
    const {EVENT_PROMPT} = prompts;

    let logic_state: boolean = false;

    function on_dismiss(event: CustomEvent<void>): void {
        prompts.EVENT_REJECT.dispatch({
            error: new PromptDismissError(),
        });

        logic_state = false;
    }

    function on_reject(event: CustomEvent<IPromptRejectEvent>): void {
        prompts.EVENT_REJECT.dispatch(event.detail);

        logic_state = false;
    }

    function on_resolve(event: CustomEvent<IPromptResolveEvent<any>>): void {
        prompts.EVENT_RESOLVE.dispatch({result: event.detail});

        logic_state = false;
    }

    async function on_transition_end(event: TransitionEvent): Promise<void> {
        await idle();

        if (!logic_state) prompts.clear();
    }

    // HACK: Svelte's first subscription listen of the `event` will always be undefined
    $: if ($EVENT_PROMPT) logic_state = true;
</script>

<Overlay.Container
    class="app-prompts"
    logic_id="app-prompts"
    dismissible={$prompts?.is_dismissible ?? false}
    {logic_state}
    on:dismiss={on_dismiss}
>
    <Overlay.Backdrop />

    <Overlay.Section on:transitionend={on_transition_end}>
        {#if $prompts}
            <Card.Container sizing="nano" max_size="75">
                {#if $prompts.title}
                    <Card.Header>
                        {$translate($prompts.title)}
                    </Card.Header>
                {/if}

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
