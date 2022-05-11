import {
    collection,
    ICollectionStore,
    IMapStore,
    make_scoped_context,
    map,
} from "@svelte-in-motion/core";
import {
    CONFIGURATION_WORKSPACES,
    IPreferencesConfiguration,
    IWorkspacesConfiguration,
} from "@svelte-in-motion/configuration";
import {CONFIGURATION_PREFERENCES} from "@svelte-in-motion/configuration";

//import * as Index from "../routes/index.old.svelte";
import * as Index from "../routes/index.svelte";

import * as WorkspaceIndex from "../routes/workspace/index.svelte";
import * as WorkspaceFile from "../routes/workspace/file.svelte";

import type {INavigatingStore, IRouterStore} from "./router";
import {routes} from "./router";
import {
    FILE_CONFIGURATION_PREFERENCES,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
} from "./storage";

export const CONTEXT_APP = make_scoped_context<IAppContext>("app");

export interface IAppContext {
    navigating: INavigatingStore;

    router: IRouterStore;

    preferences: IMapStore<IPreferencesConfiguration>;

    workspaces: ICollectionStore<IWorkspacesConfiguration>;
}

async function is_application_prepared(): Promise<boolean> {
    const [has_preferences, has_workspaces] = await Promise.all([
        STORAGE_USER.exists(FILE_CONFIGURATION_PREFERENCES),
        STORAGE_USER.exists(FILE_CONFIGURATION_WORKSPACES),
    ]);

    return has_preferences && has_workspaces;
}

async function prepare_application(): Promise<void> {
    // HACK: Validation happens via a JSONSchema, which will insert defaults for us

    await Promise.all([
        CONFIGURATION_PREFERENCES.write(STORAGE_USER, FILE_CONFIGURATION_PREFERENCES, {} as any),
        CONFIGURATION_WORKSPACES.write(STORAGE_USER, FILE_CONFIGURATION_WORKSPACES, [] as any),
    ]);
}

export async function app(): Promise<IAppContext> {
    if (!(await is_application_prepared())) await prepare_application();

    const [preferences, workspaces] = await Promise.all([
        CONFIGURATION_PREFERENCES.watch_preload(STORAGE_USER, FILE_CONFIGURATION_PREFERENCES),
        CONFIGURATION_WORKSPACES.watch_preload(STORAGE_USER, FILE_CONFIGURATION_WORKSPACES),
    ]);

    const [navigating, router] = routes(Index, WorkspaceFile, WorkspaceIndex);

    return {
        navigating,
        router,
        preferences: map(preferences),
        workspaces: collection(workspaces),
    };
}
