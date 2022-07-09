import type {IAppContext, IKeybindEvent} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";

export const EXTENSION_ABOUT = define_extension({
    identifier: "dev.nbn.sim.about",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "about.prompt.application",
            on_execute: this.command_prompt_about.bind(this),
        });

        keybinds.push({
            identifier: "about.prompt.application",
            binds: [["f2"]],
            on_bind: this.keybind_prompt_about.bind(this),
        });

        commands.push({
            identifier: "about.prompt.documentation",
            on_execute: this.command_prompt_documentation.bind(this),
        });

        keybinds.push({
            identifier: "about.prompt.documentation",
            binds: [["f1"]],
            on_bind: this.keybind_prompt_documentation.bind(this),
        });
    },

    async command_prompt_about(app: IAppContext) {
        const {prompts} = app;

        try {
            await prompts.prompt_about();
        } catch (err) {}
    },

    command_prompt_documentation(app: IAppContext) {
        open(`https://docs.sim.nbn.dev`, "_blank");
    },

    keybind_prompt_about(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_about(app);
    },

    keybind_prompt_documentation(app: IAppContext, event: IKeybindEvent) {
        if (event.active) this.command_prompt_documentation(app);
    },
});
