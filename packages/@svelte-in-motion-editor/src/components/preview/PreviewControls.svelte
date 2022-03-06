<script lang="ts">
    import {
        CONTEXT_FRAME,
        CONTEXT_FRAMERATE,
        CONTEXT_MAXFRAMES,
        CONTEXT_PLAYING,
    } from "@svelte-in-motion/core";

    const frame = CONTEXT_FRAME.get()!;
    const framerate = CONTEXT_FRAMERATE.get()!;
    const maxframes = CONTEXT_MAXFRAMES.get()!;

    const playing = CONTEXT_PLAYING.get()!;

    let duration = $maxframes / $framerate;

    $: $maxframes = Math.floor($framerate * duration);
</script>

<div class="sim--preview-controls">
    <button on:click={() => ($playing = !$playing)}>
        {$playing ? "PLAYING" : "PAUSED"}
    </button>

    <label>
        Frame: <code>({$frame}/{$maxframes})</code>
        <input type="range" min={0} max={$maxframes} bind:value={$frame} />
    </label>

    <label>
        Framerate: <code>({$framerate})</code>
        <input type="range" min={16} max={120} bind:value={$framerate} />
    </label>

    <label>
        Duration: <code>(seconds)</code>
        <input type="number" min={0} bind:value={duration} />
    </label>
</div>

<style>
    :global(.sim--preview-controls) {
        display: flex;
        flex-direction: column;

        grid-area: controls;

        border: 1px solid currentColor;
    }

    input {
        width: 100%;
    }
</style>
