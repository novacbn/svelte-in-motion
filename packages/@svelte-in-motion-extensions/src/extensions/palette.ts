import {get} from "svelte/store";

import type {ICommand} from "@svelte-in-motion/editor/src/lib/stores/commands";
import type {IExtension} from "@svelte-in-motion/editor/src/lib/stores/extensions";
import type {IKeybind, IKeybindEvent} from "@svelte-in-motion/editor/src/lib/stores/keybinds";
import type {ISearchPromptPromptEvent} from "@svelte-in-motion/editor/src/lib/stores/prompts";

import type {IAppContext} from "@svelte-in-motion/editor/src/lib/app";

import {PromptDismissError} from "@svelte-in-motion/utilities";

export const extension = {
    identifier: "dev.nbn.sim.palette",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "palette.prompt.commands",
            is_visible: false,
            on_execute: this.command_prompt_commands.bind(this),
        });

        keybinds.push({
            identifier: "palette.prompt.commands",
            binds: [["control", "shift", "p"]],
            on_bind: this.keybind_prompt_frames.bind(this),
        });
    },

    async command_prompt_commands(app: IAppContext) {
        const {commands, keybinds, prompts, translate} = app;

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
            }) as (ICommand & {keybind?: IKeybind})[];

        const $translate = get(translate);

        const documents = $commands.map((command) => {
            const {identifier: command_identifier, keybind} = command;

            const translation_identifier = command_identifier.replace(/\./g, "-");

            const bind = keybind?.binds[0].join("+").replace(/\s/g, "SPACE").toUpperCase();
            const description = $translate(`commands-${translation_identifier}-description`);
            const label = $translate(`commands-${translation_identifier}-label`);

            return {
                bind,
                identifier: command_identifier,
                description,
                label,
            };
        });

        console.log({documents});

        let selected_command: ISearchPromptPromptEvent;

        try {
            selected_command = await prompts.prompt_search({
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

        commands.execute(selected_command.identifier);
    },

    keybind_prompt_frames(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_commands(app);
    },
};

export const EXTENSION_PALETTE: IExtension = extension;
