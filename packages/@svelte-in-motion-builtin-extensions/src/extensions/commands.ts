import {get} from "svelte/store";

import type {
    IAppContext,
    ICommandItem,
    IKeybindItem,
    IKeybindEvent,
    ISearchPromptEvent,
} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";
import {PromptDismissError} from "@svelte-in-motion/utilities";

export const EXTENSION_COMMANDS = define_extension({
    identifier: "dev.nbn.sim.palette",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "commands.prompt.palette",
            is_visible: false,
            on_execute: this.command_prompt_commands.bind(this),
        });

        keybinds.push({
            identifier: "commands.prompt.palette",
            binds: [["control", "shift", "p"]],
            on_bind: this.keybind_prompt_frames.bind(this),
        });
    },

    async command_prompt_commands(app: IAppContext) {
        const {commands, keybinds, prompts, translations} = app;

        const $commands = get(commands)
            .filter((command) => {
                const {is_disabled = false, is_visible = true} = command;

                if ((typeof is_disabled === "function" && is_disabled()) || is_disabled)
                    return false;
                if ((typeof is_visible === "function" && !is_visible()) || !is_visible)
                    return false;

                return true;
            })
            .map((command) => {
                const {identifier} = command;

                const keybind = keybinds.find("identifier", identifier);
                if (keybind) {
                    const {is_visible = true} = keybind;
                    if ((typeof is_visible === "function" && is_visible()) || is_visible) {
                        return {...command, keybind};
                    }
                }

                return command;
            }) as (ICommandItem & {keybind?: IKeybindItem})[];

        const $translations = get(translations);

        const documents = $commands
            .map((command) => {
                const {identifier: command_identifier, keybind} = command;

                const translation_identifier = command_identifier.replace(/\./g, "-");

                const bind = keybind?.binds[0].join("+").replace(/\s/g, "SPACE").toUpperCase();
                const description = $translations.format(
                    `commands-${translation_identifier}-description`
                );
                const label = $translations.format(`commands-${translation_identifier}-label`);

                return {
                    bind,
                    identifier: command_identifier,
                    description,
                    label,
                };
            })
            .sort((document_a, document_b) => {
                const label_a = document_a.label.toLowerCase();
                const label_b = document_b.label.toLowerCase();

                return label_a <= label_b ? -1 : 0;
            });

        let result: ISearchPromptEvent;
        try {
            result = await prompts.prompt_search({
                is_dismissible: true,

                badge: "bind",
                description: "description",
                identifier: "identifier",
                label: "label",
                index: ["identifier", "bind", "label", "description"],

                documents,
            });
        } catch (err) {
            if (err instanceof PromptDismissError) return;
            throw err;
        }

        const command = commands.find("identifier", result.identifier)!;

        let args: any;
        if (command.type) {
            try {
                args = (
                    await prompts.prompt_form<any>({
                        is_dismissible: true,

                        namespace: command.identifier,
                        type: command.type,
                    })
                ).model;
            } catch (err) {
                if (err instanceof PromptDismissError) return;
                throw err;
            }
        }

        commands.execute(result.identifier, args);
    },

    keybind_prompt_frames(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_commands(app);
    },
});
