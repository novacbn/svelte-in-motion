<script context="module" lang="ts">
    import type {IAppContext} from "../../lib/app";
    import {CONTEXT_EDITOR, editor as make_editor_context} from "../../lib/editor";
    import type {ILoadCallback} from "../../lib/router";
    import {CONTEXT_PREVIEW, preview as make_preview_context} from "../../lib/preview";
    import {CONTEXT_WORKSPACE, workspace as make_workspace_context} from "../../lib/workspace";

    import {can_preview_file} from "../../lib/util/preview";

    export const pattern: string = "/workspace/:identifier/:file_path";

    export const load: ILoadCallback<{app: IAppContext}> = async ({context, url}) => {
        const {app} = context;
        const {identifier, file_path} = url.pathname.groups;

        const workspace = await make_workspace_context(identifier, app);

        const [editor, preview] = await Promise.all([
            make_editor_context(workspace.storage, file_path),
            can_preview_file(file_path) ? make_preview_context(file_path) : undefined,
        ]);

        app.workspace = workspace;

        workspace.editor = editor;
        workspace.preview = preview;

        return {
            context: {
                [CONTEXT_EDITOR.key]: editor,
                [CONTEXT_PREVIEW.key]: preview,
                [CONTEXT_WORKSPACE.key]: workspace,
            },
        };
    };
</script>

<script lang="ts">
    import {Now} from "@svelte-in-motion/temporal";

    import EditorLayout from "../../components/editor/EditorLayout.svelte";
    import EditorFileTree from "../../components/editor/EditorFileTree.svelte";
    import EditorScript from "../../components/editor/EditorScript.svelte";
    import EditorStatus from "../../components/editor/EditorStatus.svelte";

    import PreviewControls from "../../components/preview/PreviewControls.svelte";
    import PreviewTimeline from "../../components/preview/PreviewTimeline.svelte";
    import PreviewViewport from "../../components/preview/PreviewViewport.svelte";

    import {CONTEXT_APP} from "../../lib/app";

    const {workspaces} = CONTEXT_APP.get()!;
    const preview = CONTEXT_PREVIEW.get();
    const {metadata} = CONTEXT_WORKSPACE.get()!;

    $workspaces.workspaces = $workspaces.workspaces.map((workspace) => {
        if (workspace.identifier === $metadata.identifier) workspace.accessed_at = Now.instant();
        return workspace;
    });

    $workspaces = $workspaces;
</script>

<EditorLayout>
    <EditorScript />
    <EditorFileTree />
    <EditorStatus />

    {#if preview}
        <PreviewViewport />

        <PreviewControls />
        <PreviewTimeline />
    {/if}
</EditorLayout>
