<script lang="ts">
    export let frame: number = 0;
    export let framerate: number = 60;
    export let maxframes: number = Math.floor(60 * 4.5);

    export let playing: boolean = false;

    let duration = maxframes / framerate;

    $: maxframes = Math.floor(framerate * duration);
</script>

<div class="sim--preview-controls">
    <button on:click={() => (playing = !playing)}>
        {playing ? "PLAYING" : "PAUSED"}
    </button>

    <label>
        Frame: <code>({frame}/{maxframes})</code>
        <input type="range" min={0} max={maxframes} bind:value={frame} />
    </label>

    <label>
        Framerate: <code>({framerate})</code>
        <input type="range" min={16} max={120} bind:value={framerate} />
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
