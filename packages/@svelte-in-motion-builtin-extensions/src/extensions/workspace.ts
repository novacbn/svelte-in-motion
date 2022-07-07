import {get} from "svelte/store";

import {WorkspacesItemConfiguration} from "@svelte-in-motion/configuration";
import type {IAppContext, IKeybindEvent} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";
import {Default, Description, Label, MinLength, Pattern} from "@svelte-in-motion/type";
import {typeOf} from "@svelte-in-motion/type";
import {PromptDismissError} from "@svelte-in-motion/utilities";

const EXPRESSION_NAME = /[\w ]+/g;

interface IWorkspaceNewConfiguration {
    name: string &
        Default<""> &
        MinLength<0> &
        Pattern<typeof EXPRESSION_NAME> &
        Label<"ui-prompt-form-workspace-new-name-label"> &
        Description<"ui-prompt-form-workspace-new-name-description">;
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
    },

    async command_prompt_new(app: IAppContext) {
        const {prompts, templates, workspaces} = app;

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

        const $workspaces = get(workspaces);
        const workspace = WorkspacesItemConfiguration.from({
            name: result.name,
        });

        const storage = await workspace.make_driver();
        await templates.render(storage, "templates.simple", {});

        $workspaces.workspaces.push(workspace);
        workspaces.set($workspaces);
    },

    keybind_prompt_new(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_new(app);
    },
});
