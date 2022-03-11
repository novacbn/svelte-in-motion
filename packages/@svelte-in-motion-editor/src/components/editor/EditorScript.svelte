<script context="module" lang="ts">
    import {Divider} from "@kahi-ui/framework";

    import {highlight as code_highlight} from "../../lib/highlight";

    const highlight = (text: string) => code_highlight(text, "svelte");
</script>

<script lang="ts">
    import {CodeJar} from "@novacbn/svelte-codejar";

    import {CONTEXT_EDITOR} from "../../lib/editor";

    const {content, show_script} = CONTEXT_EDITOR.get()!;
</script>

<div class="sim--editor-script" style="display:{$show_script ? 'block' : 'none'}">
    <CodeJar class="sim--editor-script--editor" syntax="svelte" {highlight} bind:value={$content} />

    <Divider
        class="sim--editor-script--divider"
        orientation="vertical"
        palette="inverse"
        margin="none"
    />
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
