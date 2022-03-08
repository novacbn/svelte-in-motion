<script lang="ts">
    import {debounce as _debounce} from "@svelte-in-motion/animations";

    import {parse_configuration} from "@svelte-in-motion/metadata";

    export let frame: number = 0;
    export let script: string;

    export let playing: boolean = false;

    export let debounce: number = 100;

    let framerate: number = 60;
    let maxframes: number = Math.floor(60 * 4.5);

    const update = _debounce(async (script: string) => {
        const configuration = parse_configuration(script);

        ({framerate, maxframes} = configuration);
    }, debounce);

    $: _duration = maxframes / framerate;
    $: _position = Math.floor((frame / maxframes) * _duration * 1000) / 1000;

    $: update(script);
</script>

<div class="sim--preview-controls">
    <button on:click={() => (playing = !playing)}>
        {playing ? "PLAYING" : "PAUSED"}
    </button>

    <label>
        Frame: <code>({frame}/{maxframes}) ({_position}s/{_duration}s)</code>
        <input type="range" min={0} max={maxframes} bind:value={frame} />
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
