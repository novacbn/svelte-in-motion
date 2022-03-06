<script context="module" lang="ts">
    import {highlight as code_highlight} from "../../lib/highlight";

    const highlight = (text: string) => code_highlight(text, "svelte");
</script>

<script lang="ts">
    import {CodeJar} from "@novacbn/svelte-codejar";

    export let value: string;
</script>

<CodeJar class="sim--code-editor" syntax="svelte" {highlight} bind:value />

<style>
    :global(.sim--code-editor) {
        grid-area: editor;

        padding: 0 !important;
        margin: 0 !important;

        white-space: pre !important;
    }
</style>
