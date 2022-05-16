<script context="module" lang="ts">
    import type {ILoadCallback} from "../../lib/router";
    import {CONTEXT_WORKSPACE, workspace} from "../../lib/workspace";

    export const pattern: string = "/workspace/:identifier";

    export const load: ILoadCallback = async ({context,  url}) => {
        const {identifier} = url.pathname.groups;
        const {notifications} = context.app;

        const workspace_context = await workspace(identifier, notifications);

        return {
            context: {
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

    workspaces.update("identifier", $metadata.identifier, {
        last_accessed: Temporal.Now.zonedDateTimeISO().toString(),
    });
</script>

Hello World!
