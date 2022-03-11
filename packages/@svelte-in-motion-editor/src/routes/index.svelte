<script context="module" lang="ts">
    import type {ILoadCallback} from "../lib/router";
    import {GUARD_STORAGE} from "../lib/router";
    import {STORAGE_USER} from "../lib/storage";
    import {preload_editor} from "../lib/editor";

    export const pattern: string = "/:file";

    export const load: ILoadCallback = GUARD_STORAGE(async ({results}) => {
        const {file} = results.pathname.groups;

        if (!(await STORAGE_USER.hasItem(file))) {
            throw new ReferenceError(`bad navigation to '/:file' (file '${file}' not found)`);
        }

        const editor = await preload_editor(file);

        return {
            props: {
                editor,
            },
        };
    });
</script>

<script lang="ts">
    import "../lib/stores/jobs";

    import type {IEditorContext} from "../lib/editor";
    import {CONTEXT_EDITOR} from "../lib/editor";

    import AppHeader from "../components/app/AppHeader.svelte";

    import EditorLayout from "../components/editor/EditorLayout.svelte";
    import EditorScript from "../components/editor/EditorScript.svelte";
    import EditorControls from "../components/editor/EditorControls.svelte";
    import EditorRender from "../components/editor/EditorRender.svelte";
    import EditorSidebar from "../components/editor/EditorSidebar.svelte";
    import EditorTimeline from "../components/editor/EditorTimeline.svelte";

    export let editor: IEditorContext;

    CONTEXT_EDITOR.set(editor);
</script>

<EditorLayout>
    <EditorRender />

    <EditorScript />
    <EditorControls />
    <EditorTimeline />

    <EditorSidebar />
    <AppHeader />
</EditorLayout>
