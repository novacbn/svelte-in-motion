<script lang="ts">
    import {Box, Code, Divider, Stack} from "@kahi-ui/framework";
    import {derived} from "svelte/store";

    import {duration, seek} from "@svelte-in-motion/core";
    import {truncate} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_PREVIEW} from "../../lib/preview";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    const {preferences} = CONTEXT_APP.get()!;
    const {frame} = CONTEXT_PREVIEW.get()!;
    const {configuration} = CONTEXT_WORKSPACE.get()!;

    const framerate = derived(configuration, ($configuration) => $configuration.framerate);
    const maxframes = derived(configuration, ($configuration) => $configuration.maxframes);

    const _duration = duration({
        framerate,
        maxframes,
    });

    const _seek = seek({
        frame,
        framerate,
        maxframes,
    });
</script>

<Box class="sim--preview-timeline" hidden={!$preferences.ui.preview.timeline.enabled}>
    <Divider palette="inverse" margin="none" margin_bottom="tiny" />

    <Stack.Container alignment_x="left" padding_x="tiny" padding_bottom="tiny">
        <Code>
            ({$frame}/{$maxframes}) ({truncate($_seek, 3)}s/{truncate($_duration, 3)}s)
        </Code>

        <input type="range" min={0} max={$maxframes} data-width="100" bind:value={$frame} />
    </Stack.Container>
</Box>

<style>
    :global(.sim--preview-timeline) {
        grid-area: timeline;
    }
</style>
