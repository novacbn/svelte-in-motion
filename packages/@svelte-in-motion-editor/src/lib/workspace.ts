import type {Readable} from "svelte/store";
import {derived, get} from "svelte/store";

import type {IPreloadedConfigurationFileStore} from "@svelte-in-motion/configuration";
import {WorkspaceConfiguration, WorkspacesItemConfiguration} from "@svelte-in-motion/configuration";
import type {IDriver} from "@svelte-in-motion/storage";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import {FILE_CONFIGURATION_WORKSPACE} from "./util/storage";

import type {IAppContext} from "./app";
import type {IEditorContext} from "./editor";
import type {IPreviewContext} from "./preview";

export const CONTEXT_WORKSPACE = make_scoped_context<IWorkspaceContext, "workspace">("workspace");

export interface IWorkspaceContext {
    configuration: IPreloadedConfigurationFileStore<WorkspaceConfiguration>;

    editor?: IEditorContext;

    identifier: string;

    metadata: Readable<WorkspacesItemConfiguration>;

    preview?: IPreviewContext;

    storage: IDriver;
}

function is_workspace_prepared(storage: IDriver): Promise<boolean> {
    return storage.exists(FILE_CONFIGURATION_WORKSPACE);
}

export async function workspace(identifier: string, app: IAppContext): Promise<IWorkspaceContext> {
    const {workspaces} = app;

    const metadata = derived(workspaces, ($workspaces) => {
        const workspace = $workspaces.workspaces.find(
            (workspace) => workspace.identifier === identifier
        );

        if (!workspace) {
            throw new ReferenceError(
                `bad argument #0 to 'workspace' (workspace '${identifier}' not found)`
            );
        }

        return workspace;
    });

    const $metadata = get(metadata);
    const storage = await $metadata.make_driver();

    if (!(await is_workspace_prepared(storage))) {
        throw new ReferenceError(
            `bad argument #0 to 'workspace' (workspace '${identifier}' is not available to be opened)`
        );
    }

    const configuration = await WorkspaceConfiguration.preload(
        storage,
        FILE_CONFIGURATION_WORKSPACE,
        {
            parse: {ignore_errors: true},
            stringify: {is_formatted: true},
        }
    );

    return {
        configuration,
        identifier,
        metadata,
        storage,
    };
}
