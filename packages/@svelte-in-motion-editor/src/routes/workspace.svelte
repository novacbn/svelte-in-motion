<script context="module" lang="ts">
    import {define_load} from "@novacbn/svelte-router";

    import type {IAppContext} from "../lib/app";
    import type {IEditorContext} from "../lib/editor";
    import {CONTEXT_EDITOR, editor as make_editor_context} from "../lib/editor";
    import type {IPreviewContext} from "../lib/preview";
    import {CONTEXT_PREVIEW, preview as make_preview_context} from "../lib/preview";
    import type {IWorkspaceContext} from "../lib/workspace";
    import {CONTEXT_WORKSPACE, workspace as make_workspace_context} from "../lib/workspace";

    import {can_preview_file} from "../lib/util/preview";

    export const pattern: string[] = [
        "/workspace/:identifier",
        "/workspace/:identifier/:file_path",
    ];

    export const load = define_load<
        {[CONTEXT_APP.key]: IAppContext},
        {
            [CONTEXT_APP.key]: IAppContext;
            [CONTEXT_EDITOR.key]?: IEditorContext;
            [CONTEXT_PREVIEW.key]?: IPreviewContext;
            [CONTEXT_WORKSPACE.key]: IWorkspaceContext;
        }
    >(async ({pattern, services}) => {
        const {app} = services;
        const {identifier = "", file_path} = pattern.pathname.groups;

        const workspace = await make_workspace_context(identifier, app);
        app.workspace = workspace;

        if (file_path) {
            const [editor, preview] = await Promise.all([
                make_editor_context(workspace.storage, file_path),
                can_preview_file(file_path) ? make_preview_context(file_path) : undefined,
            ]);

            workspace.editor = editor;
            workspace.preview = preview;

            return {
                context: {
                    [CONTEXT_APP.key]: app,
                    [CONTEXT_EDITOR.key]: editor,
                    [CONTEXT_PREVIEW.key]: preview,
                    [CONTEXT_WORKSPACE.key]: workspace,
                },
            };
        }

        return {
            context: {
                [CONTEXT_APP.key]: app,
                [CONTEXT_WORKSPACE.key]: workspace,
            },
        };
    });
</script>

<script lang="ts">
    import {Now} from "@svelte-in-motion/temporal";

    import {CONTEXT_APP} from "../lib/app";

    import EditorLayout from "../components/editor/EditorLayout.svelte";
    import EditorFileTree from "../components/editor/EditorFileTree.svelte";
    import EditorScript from "../components/editor/EditorScript.svelte";
    import EditorStatus from "../components/editor/EditorStatus.svelte";

    import PreviewControls from "../components/preview/PreviewControls.svelte";
    import PreviewTimeline from "../components/preview/PreviewTimeline.svelte";
    import PreviewViewport from "../components/preview/PreviewViewport.svelte";

    const {workspaces} = CONTEXT_APP.get()!;
    const {metadata} = CONTEXT_WORKSPACE.get()!;

    const editor = CONTEXT_EDITOR.get();
    const preview = CONTEXT_PREVIEW.get();

    $workspaces.workspaces = $workspaces.workspaces.map((workspace) => {
        if (workspace.identifier === $metadata.identifier) workspace.accessed_at = Now.instant();
        return workspace;
    });

    $workspaces = $workspaces;
</script>

<EditorLayout>
    {#if editor}
        <EditorScript />
    {/if}

    <EditorFileTree />
    <EditorStatus />

    {#if preview}
        <PreviewViewport />

        <PreviewControls />
        <PreviewTimeline />
    {/if}
</EditorLayout>
