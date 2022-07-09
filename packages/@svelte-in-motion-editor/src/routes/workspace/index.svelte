<script context="module" lang="ts">
    import type {IAppContext} from "../../lib/app";
    import type {ILoadCallback} from "../../lib/router";
    import {CONTEXT_WORKSPACE, workspace as make_workspace_context} from "../../lib/workspace";

    export const pattern: string = "/workspace/:identifier";

    export const load: ILoadCallback<{app: IAppContext}> = async ({context, url}) => {
        const {app} = context;
        const {identifier} = url.pathname.groups;

        const workspace = await make_workspace_context(identifier, app);

        app.workspace = workspace;

        return {
            context: {
                [CONTEXT_WORKSPACE.key]: workspace,
            },
        };
    };
</script>

<script lang="ts">
    import {Now} from "@svelte-in-motion/temporal";

    import {CONTEXT_APP} from "../../lib/app";

    import EditorFileTree from "../../components/editor/EditorFileTree.svelte";
    import EditorLayout from "../../components/editor/EditorLayout.svelte";
    import EditorStatus from "../../components/editor/EditorStatus.svelte";

    const {workspaces} = CONTEXT_APP.get()!;
    const {metadata} = CONTEXT_WORKSPACE.get()!;

    $workspaces.workspaces = $workspaces.workspaces.map((workspace) => {
        if (workspace.identifier === $metadata.identifier) workspace.accessed_at = Now.instant();
        return workspace;
    });

    $workspaces = $workspaces;
</script>

<EditorLayout>
    <EditorFileTree />
    <EditorStatus />
</EditorLayout>
