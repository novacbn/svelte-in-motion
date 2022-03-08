<script context="module" lang="ts">
    import {highlight as code_highlight} from "../../lib/highlight";

    const highlight = (text: string) => code_highlight(text, "svelte");
</script>

<script lang="ts">
    import {CodeJar} from "@novacbn/svelte-codejar";
    import {onMount} from "svelte";

    import {debounce as _debounce} from "@svelte-in-motion/animations";

    import {STORAGE_USER} from "../../lib/storage";

    export let file: string;
    export let script: string = "";

    export let debounce: number = 250;

    const update_script = _debounce((value: string) => {
        STORAGE_USER.setItem(file, value);
    }, debounce);

    onMount(async () => {
        script = (await STORAGE_USER.getItem(file)) as string;
    });

    $: update_script(script);
</script>

<CodeJar class="sim--code-editor" syntax="svelte" {highlight} bind:value={script} />

<style>
    :global(.sim--code-editor) {
        grid-area: editor;

        padding: 0 !important;
        margin: 0 !important;

        white-space: pre !important;
    }
</style>
