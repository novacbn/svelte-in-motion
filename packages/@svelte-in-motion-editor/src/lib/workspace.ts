import type {Readable} from "svelte/store";
import {derived, get} from "svelte/store";

import type {IPreloadedConfigurationFileStore} from "@svelte-in-motion/configuration";
import {WorkspaceConfiguration, WorkspacesItemConfiguration} from "@svelte-in-motion/configuration";
import type {IDriver} from "@svelte-in-motion/storage";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import type {IErrorsStore} from "./stores/errors";
import {errors as make_errors_store} from "./stores/errors";

import {FILE_CONFIGURATION_WORKSPACE} from "./util/storage";

// @ts-ignore
import SAMPLE from "./templates/SAMPLE.svelte?raw";

import type {IAppContext} from "./app";
import type {IEditorContext} from "./editor";
import type {IPreviewContext} from "./preview";

export const CONTEXT_WORKSPACE = make_scoped_context<IWorkspaceContext>("workspace");

export interface IWorkspaceContext {
    configuration: IPreloadedConfigurationFileStore<WorkspaceConfiguration>;

    editor?: IEditorContext;

    errors: IErrorsStore;

    identifier: string;

    metadata: Readable<WorkspacesItemConfiguration>;

    preview?: IPreviewContext;

    storage: IDriver;
}

function is_workspace_prepared(driver: IDriver): Promise<boolean> {
    return driver.exists(FILE_CONFIGURATION_WORKSPACE);
}

async function prepare_workspace(driver: IDriver): Promise<void> {
    const configuration = new WorkspaceConfiguration();

    // TODO: Replace these after templating system is worked out

    configuration.framerate = 60;
    configuration.maxframes = 270;

    await Promise.all([
        // TODO: replace with eventual templating system
        await driver.write_file_text("Sample.svelte", SAMPLE),

        // HACK: Validation happens via a JSONSchema, which will insert defaults for us
        configuration.write(driver, FILE_CONFIGURATION_WORKSPACE, {is_formatted: true}),
    ]);
}

export async function workspace(identifier: string, app: IAppContext): Promise<IWorkspaceContext> {
    const {notifications, workspaces} = app;

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

    if (!(await is_workspace_prepared(storage))) await prepare_workspace(storage);

    const configuration = await WorkspaceConfiguration.preload(
        storage,
        FILE_CONFIGURATION_WORKSPACE,
        {
            stringify: {is_formatted: true},
        }
    );

    const errors = make_errors_store(notifications);

    return {
        configuration,
        errors,
        identifier,
        metadata,
        storage,
    };
}
