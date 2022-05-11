<script context="module" lang="ts">
    import type {ILoadCallback} from "../lib/router";
    import {GUARD_STORAGE} from "../lib/router";
    import {STORAGE_USER} from "../lib/storage";

    export const pattern: string = "/:file";

    export const load: ILoadCallback = GUARD_STORAGE(async ({results}) => {
        const {file} = results.pathname.groups;

        if (!(await STORAGE_USER.exists(file))) {
            throw new ReferenceError(`bad navigation to '/:file' (file '${file}' not found)`);
        }

        return {
            props: {
                file,
            },
        };
    });
</script>

<script lang="ts">
    import "../lib/stores/jobs";

    import {CONTEXT_EDITOR, editor} from "../lib/editor";

    import AppHeader from "../components/app/AppHeader.svelte";
    import AppNotifications from "../components/app/AppNotifications.svelte";
    import AppPrompts from "../components/app/AppPrompts.svelte";

    import EditorLayout from "../components/editor/EditorLayout.svelte";
    import EditorScript from "../components/editor/EditorScript.svelte";
    import EditorControls from "../components/editor/EditorControls.svelte";
    import EditorRender from "../components/editor/EditorRender.svelte";
    import EditorSidebar from "../components/editor/EditorSidebar.svelte";
    import EditorTimeline from "../components/editor/EditorTimeline.svelte";

    export let file: string;

    const editor_context = editor(file);
    CONTEXT_EDITOR.set(editor_context);

    $: editor_context.path.set(file);
</script>

<EditorLayout>
    <EditorRender />

    <EditorScript />
    <EditorControls />
    <EditorTimeline />

    <EditorSidebar />

    <AppNotifications />

    <AppHeader />

    <AppPrompts />
</EditorLayout>
