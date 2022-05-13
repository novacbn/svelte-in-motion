import type {
    IPreferencesConfiguration,
    IWorkspacesConfiguration,
} from "@svelte-in-motion/configuration";
import {CONFIGURATION_PREFERENCES, CONFIGURATION_WORKSPACES} from "@svelte-in-motion/configuration";
import type {ICollectionStore, IMapStore} from "@svelte-in-motion/utilities";
import {collection, make_scoped_context, map} from "@svelte-in-motion/utilities";

import * as Index from "../routes/index.svelte";

import * as WorkspaceIndex from "../routes/workspace/index.svelte";
import * as WorkspaceFile from "../routes/workspace/file.svelte";

import type {INotificationStore} from "./stores/notifications";
import {notifications as make_notification_store} from "./stores/notifications";
import type {IPromptStore} from "./stores/prompts";
import {prompts as make_prompt_store} from "./stores/prompts";

import type {INavigatingStore, IRouterStore} from "./router";
import {app_router} from "./router";
import {
    FILE_CONFIGURATION_PREFERENCES,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
} from "./storage";

export const CONTEXT_APP = make_scoped_context<IAppContext>("app");

export interface IAppContext {
    navigating: INavigatingStore;

    notifications: INotificationStore;

    preferences: IMapStore<IPreferencesConfiguration>;

    prompts: IPromptStore;

    router: IRouterStore;

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

    const [navigating, router] = app_router(Index, WorkspaceFile, WorkspaceIndex);

    const notifications = make_notification_store();
    const prompts = make_prompt_store();

    return {
        navigating,
        notifications,
        preferences: map(preferences),
        prompts,
        router,
        workspaces: collection(workspaces),
    };
}
