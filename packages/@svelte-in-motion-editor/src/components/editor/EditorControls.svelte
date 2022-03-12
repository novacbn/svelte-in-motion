<script lang="ts">
    import type {IKeybindEvent} from "@kahi-ui/framework";
    import {Box, Menu, Spacer, Text} from "@kahi-ui/framework";
    import {Edit, Grid, Palmtree, Pause, Play, SkipBack, SkipForward} from "lucide-svelte";

    import {clamp} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR, has_focus} from "../../lib/editor";
    import {
        action_next_frame,
        action_previous_frame,
        action_toggle_checkerboard,
        action_toggle_play,
        action_toggle_script,
        action_toggle_zen,
    } from "../../lib/keybinds";

    import {jobs} from "../../lib/stores/jobs";

    import Tooltip from "../Tooltip.svelte";

    const {configuration, file, frame, playing, show_checkerboard, show_script, zen_mode} =
        CONTEXT_EDITOR.get()!;

    let job_id: string | null = null;

    async function on_create_click(event: MouseEvent): Promise<void> {
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

        const video = await jobs.yield(job_id);

        const blob = new Blob([video], {type: "video/webm"});
        const url = URL.createObjectURL(blob);

        window.open(url);

        job_id = null;
    }

    function on_checkerboard_toggle(event: IKeybindEvent | MouseEvent): void {
        if (!has_focus()) return;

        if (typeof event.detail === "object") {
            event.preventDefault();

            if (!event.detail.active) return;
        }

        $show_checkerboard = !$show_checkerboard;
    }

    function on_frame_increment(event: IKeybindEvent | MouseEvent, delta: number): void {
        if ($playing || !has_focus()) return;

        if (typeof event.detail === "object") {
            event.preventDefault();

            if (!event.detail.active) return;
        }

        $frame = clamp($frame + delta, 0, $configuration.maxframes);
    }

    function on_playing_toggle(event: IKeybindEvent | MouseEvent): void {
        if (!has_focus()) return;

        if (typeof event.detail === "object") {
            event.preventDefault();

            if (!event.detail.active) return;
        }

        $playing = !$playing;
    }

    function on_script_toggle(event: IKeybindEvent | MouseEvent): void {
        if (!has_focus()) return;

        if (typeof event.detail === "object") {
            event.preventDefault();

            if (!event.detail.active) return;
        }

        $show_script = !$show_script;
    }

    function on_zen_mode(event: IKeybindEvent | MouseEvent): void {
        if (!has_focus()) return;

        if (typeof event.detail === "object") {
            event.preventDefault();

            if (!event.detail.active) return;
        }

        $zen_mode = !$zen_mode;
    }

    $: _job = job_id ? $jobs.find((job) => job.identifier === job_id) : null;
</script>

<svelte:window
    use:action_next_frame={{on_bind: (event) => on_frame_increment(event, 1)}}
    use:action_previous_frame={{on_bind: (event) => on_frame_increment(event, -1)}}
    use:action_toggle_checkerboard={{on_bind: on_checkerboard_toggle}}
    use:action_toggle_play={{on_bind: on_playing_toggle}}
    use:action_toggle_script={{on_bind: on_script_toggle}}
    use:action_toggle_zen={{on_bind: on_zen_mode}}
/>

<Box class="sim--editor-controls" palette="auto">
    <Menu.Container orientation="horizontal" sizing="tiny" margin_x="auto" padding="small">
        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    disabled={$playing}
                    palette="inverse"
                    on:click={(event) => on_frame_increment(event, -1)}
                >
                    <SkipBack size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Skip one frame forward <Text is="strong">LEFTARROW</Text>
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button palette="inverse" on:click={on_playing_toggle}>
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

            <Text is="strong">SPACEBAR</Text>
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    disabled={$playing}
                    palette="inverse"
                    on:click={(event) => on_frame_increment(event, 1)}
                >
                    <SkipForward size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Skip one frame forward <Text is="strong">RIGHTARROW</Text>
        </Tooltip>

        <Spacer spacing="medium" />

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button active={$show_script} palette="inverse" on:click={on_script_toggle}>
                    <Edit size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Toggle script editor <Text is="strong">S</Text>
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    active={$show_checkerboard}
                    palette="inverse"
                    on:click={on_checkerboard_toggle}
                >
                    <Grid size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Toggle transparency checkerboard pattern <Text is="strong">C</Text>
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button active={$zen_mode} palette="inverse" on:click={on_zen_mode}>
                    <Palmtree size="1em" />
                </Menu.Button>
            </svelte:fragment>

            Toggle zen mode <Text is="strong">Z</Text>
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
