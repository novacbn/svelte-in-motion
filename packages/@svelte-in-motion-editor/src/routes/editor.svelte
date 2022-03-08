<script context="module" lang="ts">
    import type {ILoadCallback} from "../lib/router";
    import {GUARD_STORAGE} from "../lib/router";
    import {STORAGE_USER} from "../lib/storage";

    export const pattern: string = "/editor/:file";

    export const load: ILoadCallback = GUARD_STORAGE(async ({results}) => {
        const {file} = results.pathname.groups;

        if (!(await STORAGE_USER.hasItem(file))) {
            throw new ReferenceError(`bad navigation to '/editor' (file '${file}' not found)`);
        }

        return {
            props: {
                file,
            },
        };
    });
</script>

<script lang="ts">
    import EditorCode from "../components/code/EditorCode.svelte";
    import StaticLayout from "../components/layouts/StaticLayout.svelte";
    import PreviewControls from "../components/preview/PreviewControls.svelte";
    import PreviewRender from "../components/preview/PreviewRender.svelte";

    export let file: string;

    let frame: number = 0;
    let playing: boolean = false;
    let script: string = "";
</script>

<StaticLayout>
    <EditorCode bind:script {file} />

    <PreviewControls bind:frame bind:playing {script} />

    <PreviewRender bind:frame bind:playing {file} />
</StaticLayout>
