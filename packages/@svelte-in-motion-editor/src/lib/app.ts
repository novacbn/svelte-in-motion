import {Agent} from "@svelte-in-motion/agent";
import type {IPreloadedConfigurationFileStore} from "@svelte-in-motion/configuration";
import {PreferencesConfiguration, WorkspacesConfiguration} from "@svelte-in-motion/configuration";
import type {IDriver} from "@svelte-in-motion/storage";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import type {ICommandsStore} from "./stores/commands";
import {commands as make_commands_store} from "./stores/commands";
import type {IEncodesStore} from "./stores/encodes";
import {encodes as make_encodes_store} from "./stores/encodes";
import type {IExtensionsStore} from "./stores/extensions";
import {extensions as make_extensions_store} from "./stores/extensions";
import type {IGrammarsStore} from "./stores/grammars";
import {grammars as make_grammers_store} from "./stores/grammars";
import type {IKeybindsStore} from "./stores/keybinds";
import {keybinds as make_keybinds_store} from "./stores/keybinds";
import type {ILocaleStore} from "./stores/locale";
import {locale as make_locale_store} from "./stores/locale";
import type {IJobsStore} from "./stores/jobs";
import {jobs as make_jobs_store} from "./stores/jobs";
import type {INotificationsStore} from "./stores/notifications";
import {notifications as make_notifications_store} from "./stores/notifications";
import type {IPromptsStore} from "./stores/prompts";
import {prompts as make_prompt_store} from "./stores/prompts";
import type {IRendersStore} from "./stores/renders";
import {renders as make_renders_store} from "./stores/renders";
import type {ITemplatesStore} from "./stores/templates";
import {templates as make_templates_store} from "./stores/templates";
import type {ITranslationsStore} from "./stores/translations";
import {translations as make_translations_store} from "./stores/translations";

import {
    FILE_CONFIGURATION_PREFERENCES,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
} from "./util/storage";

import type {IWorkspaceContext} from "./workspace";

export const CONTEXT_APP = make_scoped_context<IAppContext>("app");

export interface IAppContext {
    agent: Agent;

    commands: ICommandsStore;

    encodes: IEncodesStore;

    extensions: IExtensionsStore;

    grammars: IGrammarsStore;

    keybinds: IKeybindsStore;

    jobs: IJobsStore;

    locale: ILocaleStore;

    notifications: INotificationsStore;

    renders: IRendersStore;

    preferences: IPreloadedConfigurationFileStore<PreferencesConfiguration>;

    prompts: IPromptsStore;

    storage: IDriver;

    templates: ITemplatesStore;

    translations: ITranslationsStore;

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

    const agent = await Agent.connect_to();

    const notifications = make_notifications_store();
    const prompts = make_prompt_store();

    // @ts-expect-error - HACK: Not great passing context to dependent stores without having
    // other properties filled. But they don't do anything on initialization /anyway/
    const app: IAppContext = {
        notifications,
        preferences,
        prompts,
        workspaces,
    };

    app.agent = agent;
    app.storage = STORAGE_USER;

    app.locale = make_locale_store(app);
    app.translations = make_translations_store(app);

    app.commands = make_commands_store(app);
    app.extensions = make_extensions_store(app);
    app.keybinds = make_keybinds_store(app);

    app.grammars = make_grammers_store();
    app.templates = make_templates_store(app);

    app.encodes = make_encodes_store(app);
    app.renders = make_renders_store(app);
    app.jobs = make_jobs_store(app);

    return app;
}
