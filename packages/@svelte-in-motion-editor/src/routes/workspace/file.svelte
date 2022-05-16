<script context="module" lang="ts">
    import {CONTEXT_EDITOR, editor} from "../../lib/editor";
    import type {ILoadCallback} from "../../lib/router";
    import {CONTEXT_WORKSPACE, workspace} from "../../lib/workspace";

    export const pattern: string = "/workspace/:identifier/:file";

    export const load: ILoadCallback = async ({context, url}) => {
        const {identifier, file} = url.pathname.groups;
        const {notifications} = context.app;

        const workspace_context = await workspace(identifier, notifications);
        const editor_context = await editor(workspace_context.storage, file);

        return {
            context: {
                [CONTEXT_EDITOR.key]: editor_context,
                [CONTEXT_WORKSPACE.key]: workspace_context,
            },
        };
    };
</script>

<script lang="ts">
    import {Temporal} from "@js-temporal/polyfill";

    import {CONTEXT_APP} from "../../lib/app";

    const {workspaces} = CONTEXT_APP.get()!;
    const {metadata} = CONTEXT_WORKSPACE.get()!;
    const {text} = CONTEXT_EDITOR.get()!;

    workspaces.update("identifier", $metadata.identifier, {
        last_accessed: Temporal.Now.zonedDateTimeISO().toString(),
    });
</script>

<textarea>
    {$text}
</textarea>
