import type {IExtension} from "../stores/extensions";

import type {IAppContext} from "../app";

export const extension = {
    identifier: "dev.nbn.sim.editor",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands} = app;

        commands.push({
            identifier: "editor.ui.file_tree.toggle",
            is_visible: true,
            on_execute: this.command_ui_file_tree_toggle.bind(this),
        });

        commands.push({
            identifier: "editor.ui.script.toggle",
            is_visible: true,
            on_execute: this.command_ui_script_toggle.bind(this),
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
};

export const EXTENSION_EDITOR: IExtension = extension;
