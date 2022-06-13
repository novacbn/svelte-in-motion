<script context="module" lang="ts">
    import type {IAppContext} from "../../lib/app";
    import {CONTEXT_EDITOR, editor} from "../../lib/editor";
    import type {ILoadCallback} from "../../lib/router";
    import {CONTEXT_WORKSPACE, workspace} from "../../lib/workspace";

    export const pattern: string = "/workspace/:identifier/:file";

    export const load: ILoadCallback<{app: IAppContext}> = async ({context, url}) => {
        const {app} = context;
        const {identifier, file} = url.pathname.groups;

        const workspace_context = await workspace(identifier, app);
        const editor_context = await editor(workspace_context.storage, file);

        app.workspace = workspace_context;
        workspace_context.editor = editor_context;

        return {
            context: {
                [CONTEXT_EDITOR.key]: editor_context,
                [CONTEXT_WORKSPACE.key]: workspace_context,
            },
        };
    };
</script>

<script lang="ts">
    import {Now} from "@svelte-in-motion/temporal";

    import {CONTEXT_APP} from "../../lib/app";

    const {workspaces} = CONTEXT_APP.get()!;
    const {metadata} = CONTEXT_WORKSPACE.get()!;
    const {text} = CONTEXT_EDITOR.get()!;

    workspaces.update((workspaces) => {
        workspaces.workspaces = workspaces.workspaces.map((workspace) => {
            if (workspace.identifier === $metadata.identifier) {
                workspace.accessed_at = Now.instant();
            }

            return workspace;
        });

        return workspaces;
    });
</script>

<textarea>
    {$text}
</textarea>
