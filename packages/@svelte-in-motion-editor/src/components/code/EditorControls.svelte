<script lang="ts">
    import {duration, seek, truncate} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR} from "../../lib/stores/editor";
    import {EVENT_END, jobs} from "../../lib/stores/jobs";

    let job_id: string | null = null;

    const {configuration, file, frame, framerate, maxframes, playing} = CONTEXT_EDITOR.get()!;

    const _duration = duration({
        framerate,
        maxframes,
    });

    const _seek = seek({
        frame,
        framerate,
        maxframes,
    });

    function on_create_video(event: MouseEvent): void {
        job_id = jobs.queue({
            file,

            encode: {
                codec: "vp9",
                crf: 31,
                framerate: $configuration.framerate,
                height: $configuration.height,
                pixel_format: "yuv420p",
                width: $configuration.width,
            },

            render: {
                end: $configuration.maxframes,
                start: 0,
                height: $configuration.height,
                width: $configuration.width,
            },
        });
    }

    $: _job = job_id ? $jobs.find((job) => job.identifier === job_id) : null;

    $: {
        if (job_id) {
            const event = $EVENT_END;
            if (event && event.job.identifier === job_id) {
                const blob = new Blob([event.video], {type: "video/webm"});
                const url = URL.createObjectURL(blob);

                window.open(url);
            }
        }
    }
</script>

<div class="sim--editor-controls">
    <button disabled={!!job_id} on:click={on_create_video}>
        {#if _job}
            {#if _job.render}
                RENDERING
            {:else if _job.encode}
                ENCODING
            {:else}
                WORKING
            {/if}
        {:else}
            CREATE VIDEO
        {/if}
    </button>

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
