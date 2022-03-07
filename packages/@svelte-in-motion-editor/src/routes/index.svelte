<script context="module" lang="ts">
    export const pattern: string = "/";
</script>

<script lang="ts">
    import {Compositor} from "@svelte-in-motion/animations";

    import EditorCode from "../components/code/EditorCode.svelte";
    import StaticLayout from "../components/layouts/StaticLayout.svelte";
    import PreviewControls from "../components/preview/PreviewControls.svelte";
    import PreviewRender from "../components/preview/PreviewRender.svelte";

    import Sample from "./_sample.svelte?raw";

    let script = Sample;
</script>

<StaticLayout>
    <EditorCode bind:value={script} />

    <Compositor frame={0} framerate={60} maxframes={Math.floor(60 * 2.5)}>
        <PreviewControls />

        <PreviewRender value={script} />
    </Compositor>
</StaticLayout>
