import type {IExtension} from "../stores/extensions";

import type {IAppContext} from "../app";

export const extension = {
    identifier: "dev.nbn.sim.preview",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands} = app;

        commands.push({
            identifier: "preview.ui.controls.toggle",
            is_visible: true,
            on_execute: this.command_ui_controls_toggle.bind(this),
        });

        commands.push({
            identifier: "preview.ui.timeline.toggle",
            is_visible: true,
            on_execute: this.command_ui_timeline_toggle.bind(this),
        });

        commands.push({
            identifier: "preview.ui.viewport.toggle",
            is_visible: true,
            on_execute: this.command_ui_viewport_toggle.bind(this),
        });
    },

    command_ui_controls_toggle(app: IAppContext) {
        const {preferences} = app;

        preferences.update(($preferences) => {
            $preferences.ui.preview.controls.enabled = !$preferences.ui.preview.controls.enabled;

            return $preferences;
        });
    },

    command_ui_timeline_toggle(app: IAppContext) {
        const {preferences} = app;

        preferences.update(($preferences) => {
            $preferences.ui.preview.timeline.enabled = !$preferences.ui.preview.timeline.enabled;

            return $preferences;
        });
    },

    command_ui_viewport_toggle(app: IAppContext) {
        const {preferences} = app;

        preferences.update(($preferences) => {
            $preferences.ui.preview.viewport.enabled = !$preferences.ui.preview.viewport.enabled;

            return $preferences;
        });
    },
};

export const EXTENSION_PREVIEW: IExtension = extension;
