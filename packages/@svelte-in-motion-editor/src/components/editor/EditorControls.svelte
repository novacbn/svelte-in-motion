<script lang="ts">
    import {Box, Menu, Spacer} from "@kahi-ui/framework";
    import {Edit, Grid, Palmtree, Pause, Play, SkipBack, SkipForward} from "lucide-svelte";

    import {clamp} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR} from "../../lib/stores/editor";
    import {EVENT_END, jobs} from "../../lib/stores/jobs";

    import Tooltip from "../Tooltip.svelte";

    const {configuration, file, frame, playing, show_checkerboard, show_script, zen_mode} =
        CONTEXT_EDITOR.get()!;

    let job_id: string | null = null;

    function on_create_click(event: MouseEvent): void {
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

    function on_checkerboard_click(event: MouseEvent): void {
        $show_checkerboard = !$show_checkerboard;
    }

    function on_frame_click(event: MouseEvent, delta: number): void {
        $frame = clamp($frame + delta, 0, $configuration.maxframes);
    }

    function on_script_click(event: MouseEvent): void {
        $show_script = !$show_script;
    }

    function on_zen_click(event: MouseEvent): void {
        $zen_mode = !$zen_mode;
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

<Box class="sim--editor-controls" palette="auto">
    <Menu.Container orientation="horizontal" sizing="tiny" margin_x="auto" padding="small">
        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    disabled={$playing}
                    palette="inverse"
                    on:click={(event) => on_frame_click(event, -1)}
                >
                    <SkipBack size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Skip one frame forward
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button palette="inverse" on:click={() => ($playing = !$playing)}>
                    {#if $playing}
                        <Pause size="1em" />
                    {:else}
                        <Play size="1em" />
                    {/if}
                </Menu.Button>
            </svelte:fragment>

            {#if $playing}
                Pause the preview
            {:else}
                Play the preview
            {/if}
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    disabled={$playing}
                    palette="inverse"
                    on:click={(event) => on_frame_click(event, 1)}
                >
                    <SkipForward size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Skip one frame forward
        </Tooltip>

        <Spacer spacing="medium" />

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button active={$show_script} palette="inverse" on:click={on_script_click}>
                    <Edit size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Toggle script editor
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    active={$show_checkerboard}
                    palette="inverse"
                    on:click={on_checkerboard_click}
                >
                    <Grid size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Toggle transparency checkerboard pattern
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button active={$zen_mode} palette="inverse" on:click={on_zen_click}>
                    <Palmtree size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Toggle zen mode
        </Tooltip>

        <Menu.Button disabled={!!job_id} palette="inverse" on:click={on_create_click}>
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
        </Menu.Button>
    </Menu.Container>
</Box>

<style>
    :global(.sim--editor-controls) {
        display: flex;
        flex-direction: column;

        grid-area: controls;
    }
</style>
