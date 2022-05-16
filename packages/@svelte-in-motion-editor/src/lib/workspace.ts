import type {Readable} from "svelte/store";
import {get} from "svelte/store";

import type {
    IWorkspaceConfiguration,
    IWorkspacesConfiguration,
} from "@svelte-in-motion/configuration";
import {CONFIGURATION_WORKSPACE, CONFIGURATION_WORKSPACES} from "@svelte-in-motion/configuration";
import type {IDriver} from "@svelte-in-motion/storage";
import type {IMapStore} from "@svelte-in-motion/utilities";
import {collection, make_scoped_context, map} from "@svelte-in-motion/utilities";

import {
    FILE_CONFIGURATION_WORKSPACE,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
    make_driver,
} from "./storage";

import SAMPLE from "./storage/SAMPLE.svelte?raw";

import type {IErrorsStore} from "./stores/errors";
import {errors as make_errors_store} from "./stores/errors";
import type {INotificationsStore} from "./stores/notifications";

export const CONTEXT_WORKSPACE = make_scoped_context<IWorkspaceContext>("workspace");

export interface IWorkspaceContext {
    configuration: IMapStore<IWorkspaceConfiguration>;

    errors: IErrorsStore;

    metadata: Readable<IWorkspacesConfiguration>;

    storage: IDriver;
}

function is_workspace_prepared(driver: IDriver): Promise<boolean> {
    return driver.exists(FILE_CONFIGURATION_WORKSPACE);
}

async function prepare_workspace(driver: IDriver): Promise<void> {
    await Promise.all([
        // TODO: replace with eventual templating system
        await driver.write_file_text("Sample.svelte", SAMPLE),

        // HACK: Validation happens via a JSONSchema, which will insert defaults for us
        CONFIGURATION_WORKSPACE.write(driver, FILE_CONFIGURATION_WORKSPACE, {
            framerate: 60,
            maxframes: 270,

            width: 1920,
            height: 1080,
        } as any),
    ]);
}

export async function workspace(
    identifier: string,
    notifications: INotificationsStore
): Promise<IWorkspaceContext> {
    const workspaces = collection(
        await CONFIGURATION_WORKSPACES.watch_preload(STORAGE_USER, FILE_CONFIGURATION_WORKSPACES)
    );

    const metadata = workspaces.watch("identifier", identifier);

    const $metadata = get(metadata);
    if (!$metadata) {
        throw new ReferenceError(
            `bad argument #0 to 'workspace' (workspace '${identifier}' not valid)`
        );
    }

    const storage = make_driver($metadata);
    if (!(await is_workspace_prepared(storage))) await prepare_workspace(storage);

    const configuration = map(
        await CONFIGURATION_WORKSPACE.watch_preload(storage, FILE_CONFIGURATION_WORKSPACE)
    );

    const errors = make_errors_store(notifications);

    return {
        configuration,
        errors,
        // HACK: We already validated the workspace above, just TypeScript can't automagically infer
        metadata: metadata as Readable<IWorkspacesConfiguration>,
        storage,
    };
}
