<script context="module" lang="ts">
    import type {IAppContext} from "../../lib/app";
    import type {ILoadCallback} from "../../lib/router";
    import {CONTEXT_WORKSPACE, workspace} from "../../lib/workspace";

    export const pattern: string = "/workspace/:identifier";

    export const load: ILoadCallback<{app: IAppContext}> = async ({context, url}) => {
        const {app} = context;
        const {identifier} = url.pathname.groups;

        const workspace_context = await workspace(identifier, app);

        app.workspace = workspace_context;

        return {
            context: {
                [CONTEXT_WORKSPACE.key]: workspace_context,
            },
        };
    };
</script>

<script lang="ts">
    import {Now} from "@svelte-in-motion/temporal";

    import {CONTEXT_APP} from "../../lib/app";

    import EditorFileTree from "../../components/editor/EditorFileTree.svelte";
    import EditorLayout from "../../components/editor/EditorLayout.svelte";

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
</EditorLayout>
