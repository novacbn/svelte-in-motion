import {get} from "svelte/store";

import type {ICommand} from "../stores/commands";
import type {IExtension} from "../stores/extensions";
import type {IKeybind, IKeybindEvent} from "../stores/keybinds";
import type {} from "../stores/prompts";

import {is_prompt_dismiss_error} from "../util/errors";

import type {IAppContext} from "../app";

export const extension = {
    identifier: "dev.nbn.sim.palette",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "palette.prompt.commands",
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
            const command_identifier = command.identifier;
            const translation_identifier = command_identifier.replace(/\./g, "-");

            const description = $translate(`commands-${translation_identifier}-description`);
            const title = $translate(`commands-${translation_identifier}-title`);

            return {
                identifier: command_identifier,
                description,
                title,
            };
        });

        console.log({documents});
    },

    keybind_prompt_frames(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_commands(app);
    },
};

export const EXTENSION_PALETTE: IExtension = extension;
