import type {IPreloadedConfigurationFileStore} from "@svelte-in-motion/configuration";
import {PreferencesConfiguration, WorkspacesConfiguration} from "@svelte-in-motion/configuration";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import type {ICommandsStore} from "./stores/commands";
import {commands as make_commands_store} from "./stores/commands";
import type {IKeybindsStore} from "./stores/keybinds";
import {keybinds as make_keybinds_store} from "./stores/keybinds";
import type {INotificationsStore} from "./stores/notifications";
import {notifications as make_notifications_store} from "./stores/notifications";
import type {IPromptsStore} from "./stores/prompts";
import {prompts as make_prompt_store} from "./stores/prompts";

import {
    FILE_CONFIGURATION_PREFERENCES,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
} from "./util/storage";

import type {IWorkspaceContext} from "./workspace";

export const CONTEXT_APP = make_scoped_context<IAppContext>("app");

export interface IAppContext {
    commands: ICommandsStore;

    keybinds: IKeybindsStore;

    notifications: INotificationsStore;

    preferences: IPreloadedConfigurationFileStore<PreferencesConfiguration>;

    prompts: IPromptsStore;

    workspace?: IWorkspaceContext;

    workspaces: IPreloadedConfigurationFileStore<WorkspacesConfiguration>;
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

    const preferences = new PreferencesConfiguration();
    const workspaces = new WorkspacesConfiguration();

    await Promise.all([
        preferences.write(STORAGE_USER, FILE_CONFIGURATION_PREFERENCES, {is_formatted: true}),
        workspaces.write(STORAGE_USER, FILE_CONFIGURATION_WORKSPACES, {is_formatted: true}),
    ]);
}

export async function app(): Promise<IAppContext> {
    if (!(await is_application_prepared())) await prepare_application();

    const [preferences, workspaces] = await Promise.all([
        PreferencesConfiguration.preload(STORAGE_USER, FILE_CONFIGURATION_PREFERENCES, {
            stringify: {is_formatted: true},
        }),

        WorkspacesConfiguration.preload(STORAGE_USER, FILE_CONFIGURATION_WORKSPACES, {
            stringify: {is_formatted: true},
        }),
    ]);

    const notifications = make_notifications_store();
    const prompts = make_prompt_store();

    // HACK: Not great passing context to dependent stores without having
    // other properties fill. But they don't do anything on initialization /anyway/
    const app = {
        notifications,
        preferences,
        prompts,
        workspaces,
    } as IAppContext;

    app.commands = make_commands_store(app);
    app.keybinds = make_keybinds_store(app);

    return app;
}
