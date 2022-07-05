import type {IExtension} from "@svelte-in-motion/editor/src/lib/stores/extensions";
import type {IKeybindEvent} from "@svelte-in-motion/editor/src/lib/stores/keybinds";

import type {IAppContext} from "@svelte-in-motion/editor/src/lib/app";

export const extension = {
    identifier: "dev.nbn.sim.editor",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "editor.ui.file_tree.toggle",
            is_visible: () => !!app.workspace,
            on_execute: this.command_ui_file_tree_toggle.bind(this),
        });

        keybinds.push({
            identifier: "editor.ui.file_tree.toggle",
            binds: [["control", "alt", "f"]],
            on_bind: this.keybind_ui_file_tree_toggle.bind(this),
        });

        commands.push({
            identifier: "editor.ui.script.toggle",
            is_visible: () => !!app.workspace?.editor,
            on_execute: this.command_ui_script_toggle.bind(this),
        });

        keybinds.push({
            identifier: "editor.ui.script.toggle",
            binds: [["control", "shift", "s"]],
            on_bind: this.keybind_ui_script_toggle.bind(this),
        });
    },

    command_ui_file_tree_toggle(app: IAppContext) {
        const {preferences} = app;

        preferences.update(($preferences) => {
            $preferences.ui.editor.file_tree.enabled = !$preferences.ui.editor.file_tree.enabled;

            return $preferences;
        });
    },

    command_ui_script_toggle(app: IAppContext) {
        const {preferences} = app;

        preferences.update(($preferences) => {
            $preferences.ui.editor.script.enabled = !$preferences.ui.editor.script.enabled;

            return $preferences;
        });
    },

    keybind_ui_file_tree_toggle(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace) this.command_ui_file_tree_toggle(app);
    },

    keybind_ui_script_toggle(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.editor) this.command_ui_script_toggle(app);
    },
};

export const EXTENSION_EDITOR: IExtension = extension;
