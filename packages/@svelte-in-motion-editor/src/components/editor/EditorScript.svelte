<script context="module" lang="ts">
    import {Divider} from "@kahi-ui/framework";

    import {highlight as code_highlight} from "../../lib/highlight";

    const highlight = (text: string) => code_highlight(text, "svelte");
</script>

<script lang="ts">
    import type {IKeybindEvent} from "@kahi-ui/framework";
    import {CodeJar} from "@novacbn/svelte-codejar";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR, has_focus} from "../../lib/editor";
    import {action_toggle_script} from "../../lib/keybinds";

    import Loader from "../Loader.svelte";

    const {preferences} = CONTEXT_APP.get()!;
    const {text} = CONTEXT_EDITOR.get()!;

    function on_script_toggle(event: IKeybindEvent): void {
        if (!has_focus()) return;

        event.preventDefault();
        if (!event.detail.active) return;

        $preferences.ui.preview.timeline.enabled = !$preferences.ui.preview.timeline.enabled;
        $preferences = $preferences;
    }
</script>

<svelte:window use:action_toggle_script={{on_bind: on_script_toggle}} />

<div
    class="sim--editor-script"
    style="display:{$preferences.ui.editor.script.enabled ? 'block' : 'none'}"
>
    {#if $text !== null}
        <CodeJar
            class="sim--editor-script--editor"
            syntax="svelte"
            {highlight}
            bind:value={$text}
        />
    {/if}

    <Divider
        class="sim--editor-script--divider"
        orientation="vertical"
        palette="inverse"
        margin="none"
    />

    <Loader hidden={$text !== null} />
</div>

<style>
    :global(.sim--editor-script) {
        position: relative;

        grid-area: script;

        width: 65ch;
    }

    :global(.sim--editor-script--editor) {
        padding: calc(var(--spacings-block-small) * 1rem) calc(var(--spacings-block-medium) * 1rem) !important;
        margin: 0 !important;

        width: 100%;
        height: 100%;

        font-size: calc(var(--fonts-sizes-inline-tiny) * 1rem) !important;

        white-space: pre !important;
    }

    :global(.sim--editor-script--divider) {
        position: absolute;

        top: 0;
        right: 0;
    }
</style>
