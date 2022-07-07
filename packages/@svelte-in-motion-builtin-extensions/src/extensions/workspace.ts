import {get} from "svelte/store";

import {WorkspacesItemConfiguration} from "@svelte-in-motion/configuration";
import type {IAppContext, IKeybindEvent, ISearchPromptEvent} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";
import {Default, Description, Label, MinLength, Pattern} from "@svelte-in-motion/type";
import {typeOf} from "@svelte-in-motion/type";
import {PromptDismissError} from "@svelte-in-motion/utilities";

const EXPRESSION_NAME = /^[\w ]+$/;

interface IWorkspaceNewConfiguration {
    name: string &
        Default<""> &
        MinLength<0> &
        Pattern<typeof EXPRESSION_NAME> &
        Label<"ui-prompt-form-workspace-new-name-label"> &
        Description<"ui-prompt-form-workspace-new-name-description">;
}

async function render_template(app: IAppContext, name: string, template: string): Promise<void> {
    const {prompts, templates, workspaces} = app;

    const controller = new AbortController();
    prompts.prompt_loader({signal: controller.signal});

    const $workspaces = get(workspaces);
    const workspace = WorkspacesItemConfiguration.from({
        name,
    });

    const storage = await workspace.make_driver();
    await templates.render(storage, template, {});

    $workspaces.workspaces.push(workspace);
    workspaces.set($workspaces);

    controller.abort();
}

export const EXTENSION_WORKSPACE = define_extension({
    identifier: "dev.nbn.sim.workspace",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

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
            identifier: "workspace.prompt.new_from_template",
            on_execute: this.command_prompt_new_from_template.bind(this),
        });

        keybinds.push({
            identifier: "workspace.prompt.new_from_template",
            binds: [["control", "shift", "m"]],
            on_bind: this.keybind_prompt_new_from_template.bind(this),
        });
    },

    async command_prompt_new(app: IAppContext) {
        const {prompts} = app;

        let result: IWorkspaceNewConfiguration;
        try {
            result = (
                await prompts.prompt_form<IWorkspaceNewConfiguration>({
                    is_dismissible: true,
                    title: "ui-prompt-form-workspace-new-title",

                    type: typeOf<IWorkspaceNewConfiguration>(),
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        render_template(app, result.name, "templates.welcome");
    },

    async command_prompt_new_from_template(app: IAppContext) {
        const {prompts, templates, translations} = app;

        const $templates = get(templates);
        const $translations = get(translations);

        const documents = $templates.map((template) => {
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

        let form_result: IWorkspaceNewConfiguration;
        try {
            form_result = (
                await prompts.prompt_form<IWorkspaceNewConfiguration>({
                    is_dismissible: true,
                    title: "ui-prompt-form-workspace-new-title",

                    type: typeOf<IWorkspaceNewConfiguration>(),
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        render_template(app, form_result.name, search_result.identifier);
    },

    keybind_prompt_new(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_new(app);
    },

    keybind_prompt_new_from_template(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_new_from_template(app);
    },
});
