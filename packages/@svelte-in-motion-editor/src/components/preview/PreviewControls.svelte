<script lang="ts">
    import type {IKeybindEvent} from "@kahi-ui/framework";
    import {Box, Menu, Text} from "@kahi-ui/framework";
    import {Pause, Play, SkipBack, SkipForward} from "lucide-svelte";

    import {clamp} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR, has_focus} from "../../lib/editor";
    import {
        action_next_frame,
        action_previous_frame,
        action_toggle_controls,
        action_toggle_play,
    } from "../../lib/keybinds";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    import Tooltip from "../Tooltip.svelte";

    const {preferences} = CONTEXT_APP.get()!;
    const {frame, playing} = CONTEXT_EDITOR.get()!;
    const {configuration} = CONTEXT_WORKSPACE.get()!;

    function on_controls_toggle(event: IKeybindEvent): void {
        if (!has_focus()) return;

        event.preventDefault();
        if (!event.detail.active) return;

        preferences.set(
            "ui.preview.controls.enabled",
            !preferences.get("ui.preview.controls.enabled")
        );
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
</script>

<svelte:window
    use:action_next_frame={{on_bind: (event) => on_frame_increment(event, 1)}}
    use:action_previous_frame={{on_bind: (event) => on_frame_increment(event, -1)}}
    use:action_toggle_play={{on_bind: on_playing_toggle}}
    use:action_toggle_controls={{on_bind: on_controls_toggle}}
/>

<Box class="sim--preview-controls" palette="auto" hidden={$preferences.ui.preview.controls.enabled}>
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
    </Menu.Container>
</Box>

<style>
    :global(.sim--preview-controls) {
        display: flex;
        flex-direction: column;

        grid-area: controls;
    }
</style>
