<script lang="ts">
    import {Box, Code, Divider, Stack} from "@kahi-ui/framework";

    import {duration, seek, truncate} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR} from "../../lib/stores/editor";

    const {configuration, frame, framerate, maxframes} = CONTEXT_EDITOR.get()!;

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

<Box class="sim--editor-timeline">
    <Divider palette="inverse" margin="none" margin_bottom="tiny" />

    <Stack.Container alignment_x="left" padding_x="tiny" padding_bottom="tiny">
        <Code>
            ({$frame}/{$configuration.maxframes}) ({truncate($_seek, 3)}s/{truncate(
                $_duration,
                3
            )}s)
        </Code>

        <input
            type="range"
            min={0}
            max={$configuration.maxframes}
            data-width="100"
            bind:value={$frame}
        />
    </Stack.Container>
</Box>

<style>
    :global(.sim--editor-timeline) {
        grid-area: timeline;
    }
</style>
