<script lang="ts">
    import {CONTEXT_EDITOR} from "../../lib/stores/editor";

    const {configuration, frame, playing} = CONTEXT_EDITOR.get()!;

    $: _duration = $configuration.maxframes / $configuration.framerate;
    $: _position = Math.floor(($frame / $configuration.maxframes) * _duration * 1000) / 1000;
</script>

<div class="sim--editor-controls">
    <button on:click={() => ($playing = !$playing)}>
        {playing ? "PLAYING" : "PAUSED"}
    </button>

    <label>
        Frame: <code>({$frame}/{$configuration.maxframes}) ({_position}s/{_duration}s)</code>
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
