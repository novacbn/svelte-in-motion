import type {IAppContext, IKeybindEvent} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";

import {NoEditorUserError, NoWorkspaceUserError} from "../util/errors";

export const EXTENSION_EDITOR = define_extension({
    identifier: "dev.nbn.sim.editor",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "editor.close",
            is_visible: () => !!app.workspace?.editor,
            on_execute: this.command_close.bind(this),
        });

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
            binds: [["control", "alt", "s"]],
            on_bind: this.keybind_ui_script_toggle.bind(this),
        });
    },

    command_close(app: IAppContext) {
        const {workspace} = app;
        if (!workspace) throw new NoWorkspaceUserError();

        const {editor} = workspace;
        if (!editor) throw new NoEditorUserError();

        location.hash = `#/workspace/${workspace.identifier}`;
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
});
