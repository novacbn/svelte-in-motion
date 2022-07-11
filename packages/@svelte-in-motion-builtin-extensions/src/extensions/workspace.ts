import {get} from "svelte/store";

import {WorkspacesItemConfiguration} from "@svelte-in-motion/configuration";
import type {IAppContext, IKeybindEvent, ISearchPromptEvent} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";
import {Default, MinLength, Pattern} from "@svelte-in-motion/type";
import {typeOf} from "@svelte-in-motion/type";
import {PromptDismissError} from "@svelte-in-motion/utilities";

import {NoWorkspaceUserError} from "../util/errors";

const EXPRESSION_FILE_NAME = /^[\w _\.\(\)\[\]]+$/;

const EXPRESSION_NAME = /^[\w ]+$/;

interface FileNew {
    file_name: string & MinLength<1> & Pattern<typeof EXPRESSION_FILE_NAME>;
}

interface WorkspaceNew {
    name: string & Default<""> & MinLength<0> & Pattern<typeof EXPRESSION_NAME>;
}

async function render_template(
    app: IAppContext,
    name: string,
    template: string,
    tokens: any = {}
): Promise<void> {
    const {prompts, templates, workspaces} = app;

    const controller = new AbortController();
    prompts.prompt_loader({signal: controller.signal});

    const $workspaces = get(workspaces);
    const workspace = WorkspacesItemConfiguration.from({
        name,
    });

    const storage = await workspace.make_driver();
    await templates.render(storage, template, tokens);

    $workspaces.workspaces.push(workspace);
    workspaces.set($workspaces);

    controller.abort();
}

export const EXTENSION_WORKSPACE = define_extension({
    identifier: "dev.nbn.sim.workspace",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds, workspaces} = app;

        commands.push({
            identifier: "workspace.close",
            is_visible: () => !!app.workspace,
            on_execute: this.command_close.bind(this),
        });

        commands.push({
            identifier: "workspace.prompt.new",
            on_execute: this.command_prompt_new.bind(this),
        });

        keybinds.push({
            identifier: "workspace.prompt.new",
            binds: [["control", "shift", "e"]],
            on_bind: this.keybind_prompt_new.bind(this),
        });

        commands.push({
            identifier: "workspace.prompt.new_file",
            is_visible: () => !!app.workspace,
            on_execute: this.command_prompt_new_file.bind(this),
        });

        keybinds.push({
            identifier: "workspace.prompt.new_file",
            binds: [["control", "shift", "f"]],
            on_bind: this.keybind_prompt_new_file.bind(this),
        });

        commands.push({
            identifier: "workspace.prompt.new_from_template",
            on_execute: this.command_prompt_new_from_template.bind(this),
        });

        keybinds.push({
            identifier: "workspace.prompt.new_from_template",
            binds: [["control", "shift", "m"]],
            on_bind: this.keybind_prompt_new_from_template.bind(this),
        });

        commands.push({
            identifier: "workspace.prompt.open_recent",
            is_visible: () => get(workspaces).workspaces.length > 0,
            on_execute: this.command_prompt_open_recent.bind(this),
        });

        keybinds.push({
            identifier: "workspace.prompt.open_recent",
            binds: [["control", "shift", "c"]],
            is_disabled: () => get(workspaces).workspaces.length > 0,
            is_visible: () => get(workspaces).workspaces.length > 0,
            on_bind: this.keybind_prompt_open_recent.bind(this),
        });
    },

    command_close(app: IAppContext) {
        const {workspace} = app;
        if (!workspace) throw new NoWorkspaceUserError();

        location.hash = ``;
    },

    async command_prompt_new(app: IAppContext) {
        const {prompts} = app;

        let result: WorkspaceNew;
        try {
            result = (
                await prompts.prompt_form<WorkspaceNew>({
                    is_dismissible: true,

                    namespace: "workspace_new",
                    type: typeOf<WorkspaceNew>(),
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        render_template(app, result.name, "welcome");
    },

    async command_prompt_new_file(app: IAppContext) {
        const {prompts, workspace} = app;

        if (!workspace) throw new NoWorkspaceUserError();

        let result: FileNew;
        try {
            result = (
                await prompts.prompt_form<FileNew>({
                    is_dismissible: true,

                    namespace: "file_new",
                    type: typeOf<FileNew>(),
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        const {storage} = workspace;

        await storage.write_file_text(result.file_name, "");
    },

    async command_prompt_new_from_template(app: IAppContext) {
        const {prompts, templates, translations} = app;

        const $templates = get(templates);
        const $translations = get(translations);

        const documents = $templates
            .map((template) => {
                const {identifier: template_identifier} = template;

                const translation_identifier = template_identifier.replace(/\./g, "-");

                const description = $translations.format(
                    `templates-${translation_identifier}-description`
                );
                const label = $translations.format(`templates-${translation_identifier}-label`);

                return {
                    identifier: template_identifier,
                    description,
                    label,
                };
            })
            .sort((document_a, document_b) => {
                const label_a = document_a.label.toLowerCase();
                const label_b = document_b.label.toLowerCase();

                return label_a <= label_b ? -1 : 0;
            });

        let search_result: ISearchPromptEvent;
        try {
            search_result = await prompts.prompt_search({
                is_dismissible: true,

                description: "description",
                identifier: "identifier",
                label: "label",
                index: ["identifier", "label", "description"],

                documents,
            });
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        let form_result: WorkspaceNew;
        try {
            form_result = (
                await prompts.prompt_form<WorkspaceNew>({
                    is_dismissible: true,

                    namespace: "workspace_new",
                    type: typeOf<WorkspaceNew>(),
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        const template = templates.find("identifier", search_result.identifier)!;

        let tokens: any;
        if ("type" in template) {
            try {
                tokens = (
                    await prompts.prompt_form<any>({
                        is_dismissible: true,

                        namespace: template.identifier,
                        type: template.type,
                    })
                ).model;
            } catch (err) {
                if (err instanceof PromptDismissError) return;
                throw err;
            }
        }

        render_template(app, form_result.name, search_result.identifier, tokens);
    },

    async command_prompt_open_recent(app: IAppContext) {
        const {prompts, workspaces} = app;

        const $workspaces = get(workspaces);

        const documents = $workspaces.workspaces
            .sort((workspace_a, workspace_b) => {
                const {seconds} = workspace_a.accessed_at.until(workspace_b.accessed_at, {
                    largestUnit: "seconds",
                    smallestUnit: "seconds",
                });

                return seconds < 0 ? -1 : 0;
            })
            .map((workspace) => {
                return {
                    identifier: workspace.identifier,
                    label: workspace.name,
                    timestamp: workspace.format_accessed(),
                };
            });

        let result: ISearchPromptEvent;
        try {
            result = await prompts.prompt_search({
                is_dismissible: true,

                badge: "timestamp",
                identifier: "identifier",
                label: "label",
                index: ["identifier", "label", "timestamp"],

                documents,
            });
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        if (!location.hash) location.hash = `#/workspace/${result.identifier}`;
        else open(`#/workspace/${result.identifier}`, "_blank");
    },

    keybind_prompt_new(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_new(app);
    },

    keybind_prompt_new_file(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.editor) this.command_prompt_new_file(app);
    },

    keybind_prompt_new_from_template(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_new_from_template(app);
    },

    keybind_prompt_open_recent(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_open_recent(app);
    },
});
