//import {X} from "lucide-svelte";
import {get} from "svelte/store";

import type {IExtension} from "../stores/extensions";

import type {IAppContext} from "../app";

export const extension = {
    identifier: "dev.nbn.sim.preview",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands} = app;

        commands.push({
            identifier: "preview.playback.frame.next",
            is_visible: true,
            on_execute: this.command_playback_frame_next.bind(this),
        });

        commands.push({
            identifier: "preview.playback.frame.previous",
            is_visible: true,
            on_execute: this.command_playback_frame_previous.bind(this),
        });

        commands.push({
            identifier: "preview.playback.toggle",
            is_visible: true,
            on_execute: this.command_playback_toggle.bind(this),
        });

        commands.push({
            identifier: "preview.ui.checkerboard.toggle",
            is_visible: true,
            on_execute: this.command_ui_checkerboard_toggle.bind(this),
        });

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

    command_playback_frame_next(app: IAppContext) {
        const {notifications, workspace} = app;
        if (!workspace) {
            notifications.push({
                //icon: X,
                header: "No workspace is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {preview} = workspace;
        if (!preview) {
            notifications.push({
                //icon: X,
                header: "No preview is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        preview.frame.update(($frame) => {
            const {maxframes} = get(workspace.configuration);

            return Math.min($frame + 1, maxframes);
        });
    },

    command_playback_frame_previous(app: IAppContext) {
        const {notifications, workspace} = app;
        if (!workspace) {
            notifications.push({
                //icon: X,
                header: "No workspace is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {preview} = workspace;
        if (!preview) {
            notifications.push({
                //icon: X,
                header: "No preview is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        preview.frame.update(($frame) => {
            return Math.max($frame - 1, 0);
        });
    },

    command_playback_toggle(app: IAppContext) {
        const {notifications, workspace} = app;
        if (!workspace) {
            notifications.push({
                //icon: X,
                header: "No workspace is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {preview} = workspace;
        if (!preview) {
            notifications.push({
                //icon: X,
                header: "No preview is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        preview.playing.update(($playing) => {
            return !$playing;
        });
    },

    command_ui_checkerboard_toggle(app: IAppContext) {
        const {preferences} = app;

        preferences.update(($preferences) => {
            $preferences.ui.preview.checkerboard.enabled =
                !$preferences.ui.preview.checkerboard.enabled;

            return $preferences;
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
