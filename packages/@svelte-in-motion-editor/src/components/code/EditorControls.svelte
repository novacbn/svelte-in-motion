<script lang="ts">
    import {duration, seek, truncate} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR} from "../../lib/stores/editor";

    const {configuration, frame, framerate, maxframes, playing} = CONTEXT_EDITOR.get()!;

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

<div class="sim--editor-controls">
    <button on:click={() => ($playing = !$playing)}>
        {$playing ? "PLAYING" : "PAUSED"}
    </button>

    <label>
        Frame: <code>
            ({$frame}/{$configuration.maxframes}) ({truncate($_seek, 3)}s/{truncate(
                $_duration,
                3
            )}s)
        </code>
        <input type="range" min={0} max={$configuration.maxframes} bind:value={$frame} />
    </label>
</div>

<style>
    :global(.sim--editor-controls) {
        display: flex;
        flex-direction: column;

        grid-area: controls;

        border: 1px solid currentColor;
    }

    input {
        width: 100%;
    }
</style>
