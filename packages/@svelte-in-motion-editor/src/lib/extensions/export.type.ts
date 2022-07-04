import {get} from "svelte/store";

import {download_blob, download_buffer} from "@svelte-in-motion/utilities";

import type {IExtension} from "../stores/extensions";
import type {IKeybindEvent} from "../stores/keybinds";
import type {IExportFramesPromptEvent, IExportVideoPromptEvent} from "../stores/prompts";

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
            binds: [["control", "shift", "f"]],
            on_bind: this.keybind_prompt_frames.bind(this),
        });

        commands.push({
            identifier: "export.prompt.video",
            is_visible: true,
            on_execute: this.command_prompt_video.bind(this),
        });

        keybinds.push({
            identifier: "export.prompt.video",
            binds: [["control", "shift", "v"]],
            on_bind: this.keybind_prompt_video.bind(this),
        });
    },

    async command_prompt_frames(app: IAppContext) {
        const {notifications, prompts, renders, workspace} = app;
        if (!workspace) {
            notifications.push({
                //icon: X,
                header: "No workspace is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {configuration, editor, preview} = workspace;

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
                header: "Opened file is not renderable",
                is_dismissible: true,
            });

            return;
        }

        const {maxframes} = get(configuration);

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
        const render_identifier = await renders.queue({
            workspace: workspace.identifier,
            file: file_path,

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

    async command_prompt_video(app: IAppContext) {
        const {jobs, notifications, prompts, workspace} = app;
        if (!workspace) {
            notifications.push({
                //icon: X,
                header: "No workspace is currently loaded",
                is_dismissible: true,
            });

            return;
        }

        const {configuration, editor, preview} = workspace;

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
                header: "Opened file is not renderable",
                is_dismissible: true,
            });

            return;
        }

        const {file_path} = editor;
        const {framerate, height, maxframes, width} = get(configuration);

        let export_configuration: IExportVideoPromptEvent;
        try {
            export_configuration = await prompts.prompt_export_video({
                frame_min: 0,
                frame_max: maxframes,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        const job_identifier = await jobs.queue({
            file: file_path,
            workspace: workspace.identifier,

            encode: {
                codec: export_configuration.codec,
                crf: export_configuration.crf,
                framerate,
                height,
                pixel_format: export_configuration.pixel_format,
                width,
            },

            render: {
                end: export_configuration.end,
                start: export_configuration.start,
            },
        });

        const notification_identifier = jobs.track(job_identifier, () =>
            jobs.remove(job_identifier)
        );
        const video = await jobs.yield(job_identifier);

        notifications.update("identifier", notification_identifier, {
            //icon: Download,
            header: "Downloading Video",
            is_dismissible: true,
        });

        // HACK: / TODO: Update later to support variable video container format

        download_buffer(
            video,
            `svelte-in-motion.video.${export_configuration.start}-${export_configuration.end}.${file_path}.webm`,
            `video/webm`
        );
    },

    keybind_prompt_frames(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.preview) this.command_prompt_frames(app);
    },

    keybind_prompt_video(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.preview) this.command_prompt_video(app);
    },
};

export const EXTENSION_EXPORT: IExtension = extension;
