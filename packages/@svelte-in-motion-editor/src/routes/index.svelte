<script context="module" lang="ts">
    export const pattern: string = "/";
</script>

<script lang="ts">
    import EditorCode from "../components/code/EditorCode.svelte";
    import StaticLayout from "../components/layouts/StaticLayout.svelte";
    import PreviewControls from "../components/preview/PreviewControls.svelte";
    import PreviewRender from "../components/preview/PreviewRender.svelte";

    import Sample from "./_sample.svelte?raw";

    let frame: number = 0;
    let framerate: number = 60;
    let maxframes: number = Math.floor(60 * 4.5);

    let playing: boolean = false;

    let script = Sample;
</script>

<StaticLayout>
    <EditorCode bind:value={script} />

    <PreviewControls bind:frame bind:framerate bind:maxframes bind:playing />

    <PreviewRender bind:frame {framerate} {maxframes} {playing} {script} />
</StaticLayout>
