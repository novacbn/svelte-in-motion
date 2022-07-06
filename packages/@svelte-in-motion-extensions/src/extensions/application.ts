import type {IExtension} from "@svelte-in-motion/editor/src/lib/stores/extensions";
import type {IKeybindEvent} from "@svelte-in-motion/editor/src/lib/stores/keybinds";

import type {IAppContext} from "@svelte-in-motion/editor/src/lib/app";

export const extension = {
    identifier: "dev.nbn.sim.application",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "application.prompt.about",
            on_execute: this.command_prompt_about.bind(this),
        });

        keybinds.push({
            identifier: "application.prompt.about",
            binds: [["f1"]],
            on_bind: this.keybind_prompt_about.bind(this),
        });
    },

    async command_prompt_about(app: IAppContext) {
        const {prompts} = app;

        try {
            await prompts.prompt_about();
        } catch (err) {}
    },

    keybind_prompt_about(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_about(app);
    },
};

export const EXTENSION_APPLICATION: IExtension = extension;