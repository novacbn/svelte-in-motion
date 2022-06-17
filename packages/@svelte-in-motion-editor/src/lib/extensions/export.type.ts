import {get} from "svelte/store";

import {download_blob} from "@svelte-in-motion/utilities";

import type {IExtension} from "../stores/extensions";
import type {IKeybindEvent} from "../stores/keybinds";
import type {IExportFramesPromptEvent} from "../stores/prompts";

import {is_prompt_dismiss_error} from "../util/errors";
import {zip_frames} from "../util/io";

import type {IAppContext} from "../app";

export const extension = {
    identifier: "dev.nbn.sim.export",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "export.prompt.frames",
            is_visible: true,
            on_execute: this.command_prompt_frames.bind(this),
        });

        keybinds.push({
            identifier: "export.prompt.frames",
            binds: [["control", "e", "f"]],
            on_bind: this.keybind_prompt_frames.bind(this),
        });
    },

    async command_prompt_frames(app: IAppContext) {
        const {notifications, prompts, workspace} = app;
        if (!workspace) {
            notifications.push({
                //icon: X,
                header: "No workspace is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {configuration, editor, preview, renders} = workspace;

        if (!editor) {
            notifications.push({
                //icon: X,
                header: "No editor is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        if (!preview) {
            notifications.push({
                //icon: X,
                header: "No preview is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {height, maxframes, width} = get(configuration);

        let export_configuration: IExportFramesPromptEvent;
        try {
            export_configuration = await prompts.prompt_export_frames({
                frame_min: 0,
                frame_max: maxframes,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        const {file_path} = editor;
        const render_identifier = renders.queue({
            workspace: workspace.identifier,
            file: file_path,

            height,
            width,

            end: export_configuration.end,
            start: export_configuration.start,
        });

        const notification_identifier = renders.track(render_identifier, () =>
            renders.remove(render_identifier)
        );
        const frames = await renders.yield(render_identifier);

        notifications.update("identifier", notification_identifier, {
            //icon: Archive,
            header: "Archiving Frames",
            is_dismissible: false,
        });

        const zip = await zip_frames(frames);

        notifications.update("identifier", notification_identifier, {
            //icon: Download,
            header: "Downloading Archive",
            is_dismissible: true,
        });

        download_blob(
            zip,
            `svelte-in-motion.frames.${export_configuration.start}-${export_configuration.end}.${file_path}.zip`
        );
    },

    keybind_prompt_frames(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.editor) this.command_prompt_frames(app);
    },
};

export const EXTENSION_EXPORT: IExtension = extension;
