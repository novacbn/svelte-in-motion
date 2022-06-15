<script lang="ts">
    import {Box, Menu, Text} from "@kahi-ui/framework";
    //import {Pause, Play, SkipBack, SkipForward} from "lucide-svelte";

    import {CONTEXT_APP} from "../../lib/app";

    import {CONTEXT_PREVIEW} from "../../lib/preview";

    import Tooltip from "../Tooltip.svelte";

    const {commands, preferences} = CONTEXT_APP.get()!;
    const {playing} = CONTEXT_PREVIEW.get()!;
</script>

<Box
    class="sim--preview-controls"
    palette="auto"
    hidden={!$preferences.ui.preview.controls.enabled}
>
    <Menu.Container orientation="horizontal" sizing="tiny" margin_x="auto" padding="small">
        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    disabled={$playing}
                    palette="inverse"
                    on:click={(event) => commands.execute("preview.playback.frame.previous")}
                >
                    <!--
                        <SkipBack size="1em" />
                    -->
                    PREV FRAME
                </Menu.Button>
            </svelte:fragment>

            Skip one frame forward <Text is="strong">LEFTARROW</Text>
        </Tooltip>

        <Tooltip placement="top" alignment_x="right">
            <svelte:fragment slot="activator">
                <Menu.Button
                    palette="inverse"
                    on:click={(event) => commands.execute("preview.playback.toggle")}
                >
                    {#if $playing}
                        <!-- 
                            <Pause size="1em" />
                        -->
                        PAUSE
                    {:else}
                        <!--
                            <Play size="1em" />
                        -->

                        PLAY
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
                    on:click={(event) => commands.execute("preview.playback.frame.next")}
                >
                    NEXT FRAME
                    <!--
                        <SkipForward size="1em" />
                    -->
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
