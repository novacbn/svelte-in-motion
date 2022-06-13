import type {Readable} from "svelte/store";
import {derived, get} from "svelte/store";

import type {IPreloadedConfigurationFileStore} from "@svelte-in-motion/configuration";
import {WorkspaceConfiguration, WorkspacesItemConfiguration} from "@svelte-in-motion/configuration";
import type {IDriver} from "@svelte-in-motion/storage";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import {FILE_CONFIGURATION_WORKSPACE} from "./storage";

import SAMPLE from "./storage/SAMPLE.svelte?raw";

import type {IEncodesStore} from "./stores/encodes";
import {encodes as make_encodes_store} from "./stores/encodes";
import type {IErrorsStore} from "./stores/errors";
import {errors as make_errors_store} from "./stores/errors";
import type {IJobsStore} from "./stores/jobs";
import {jobs as make_jobs_store} from "./stores/jobs";
import type {IRendersStore} from "./stores/renders";
import {renders as make_renders_store} from "./stores/renders";

import type {IAppContext} from "./app";
import type {IEditorContext} from "./editor";

export const CONTEXT_WORKSPACE = make_scoped_context<IWorkspaceContext>("workspace");

export interface IWorkspaceContext {
    configuration: IPreloadedConfigurationFileStore<WorkspaceConfiguration>;

    editor?: IEditorContext;

    encodes: IEncodesStore;

    errors: IErrorsStore;

    identifier: string;

    metadata: Readable<WorkspacesItemConfiguration>;

    jobs: IJobsStore;

    renders: IRendersStore;

    storage: IDriver;
}

function is_workspace_prepared(driver: IDriver): Promise<boolean> {
    return driver.exists(FILE_CONFIGURATION_WORKSPACE);
}

async function prepare_workspace(driver: IDriver): Promise<void> {
    const configuration = new WorkspaceConfiguration();

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
                `bad update to 'metadata' (workspace '${identifier}' not found)`
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

    const encodes = make_encodes_store(notifications);
    const renders = make_renders_store(notifications);

    const jobs = make_jobs_store(notifications, encodes, renders);

    return {
        configuration,
        encodes,
        errors,
        identifier,
        jobs,
        metadata,
        renders,
        storage,
    };
}
