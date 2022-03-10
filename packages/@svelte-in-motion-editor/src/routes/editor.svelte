<script context="module" lang="ts">
    import type {ILoadCallback} from "../lib/router";
    import {GUARD_STORAGE} from "../lib/router";
    import {STORAGE_USER} from "../lib/storage";
    import {preload_editor} from "../lib/stores/editor";

    export const pattern: string = "/editor/:file";

    export const load: ILoadCallback = GUARD_STORAGE(async ({results}) => {
        const {file} = results.pathname.groups;

        if (!(await STORAGE_USER.hasItem(file))) {
            throw new ReferenceError(`bad navigation to '/editor' (file '${file}' not found)`);
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

    import type {IEditorContext} from "../lib/stores/editor";
    import {CONTEXT_EDITOR} from "../lib/stores/editor";

    import EditorCode from "../components/code/EditorCode.svelte";
    import EditorControls from "../components/code/EditorControls.svelte";
    import EditorRender from "../components/code/EditorRender.svelte";
    import StaticLayout from "../components/layouts/StaticLayout.svelte";

    export let editor: IEditorContext;

    CONTEXT_EDITOR.set(editor);
</script>

<StaticLayout>
    <EditorCode />
    <EditorControls />
    <EditorRender />
</StaticLayout>
