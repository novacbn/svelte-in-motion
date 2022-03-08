<script context="module" lang="ts">
    import {highlight as code_highlight} from "../../lib/highlight";

    const highlight = (text: string) => code_highlight(text, "svelte");
</script>

<script lang="ts">
    import {CodeJar} from "@novacbn/svelte-codejar";

    import {CONTEXT_EDITOR} from "../../lib/stores/editor";

    const {content} = CONTEXT_EDITOR.get()!;
</script>

<CodeJar class="sim--editor-code" syntax="svelte" {highlight} bind:value={$content} />

<style>
    :global(.sim--editor-code) {
        grid-area: editor;

        padding: 0 !important;
        margin: 0 !important;

        white-space: pre !important;
    }
</style>
