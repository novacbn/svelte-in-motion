import {get} from "svelte/store";

import type {IExtension} from "@svelte-in-motion/editor/src/lib/stores/extensions";
import type {IKeybindEvent} from "@svelte-in-motion/editor/src/lib/stores/keybinds";

import type {IAppContext} from "@svelte-in-motion/editor/src/lib/app";

import {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import {Default, Description, Label, Minimum, Namespace, Placeholder} from "@svelte-in-motion/type";
import {typeOf} from "@svelte-in-motion/type";
import {PromptDismissError, download_blob, download_buffer} from "@svelte-in-motion/utilities";

import {zip_frames} from "../util/io";

interface IFramesExportConfiguration {
    start: number &
        Default<0> &
        Minimum<0> &
        Label<"ui-prompt-form-frames-export-start-label"> &
        Description<"ui-prompt-form-frames-export-start-description">;

    end: number &
        Default<0> &
        Minimum<0> &
        Label<"ui-prompt-form-frames-export-end-label"> &
        Description<"ui-prompt-form-frames-export-end-description">;
}

interface IVideoExportConfiguration {
    start: number &
        Default<0> &
        Minimum<0> &
        Label<"ui-prompt-form-video-export-start-label"> &
        Description<"ui-prompt-form-video-export-start-description">;

    end: number &
        Default<0> &
        Minimum<0> &
        Label<"ui-prompt-form-video-export-end-label"> &
        Description<"ui-prompt-form-video-export-end-description">;

    codec: ICodecNames &
        Default<"vp9"> &
        Label<"ui-prompt-form-video-export-codec-label"> &
        Placeholder<"ui-prompt-form-video-export-codec-placeholder"> &
        Namespace<"ui-prompt-form-video-export-codec-${identifier}-label">;

    crf: number &
        Default<31> &
        Minimum<0> &
        Label<"ui-prompt-form-video-export-crf-label"> &
        Description<"ui-prompt-form-video-export-crf-description">;

    pixel_format: IPixelFormatNames &
        Default<"yuv420p"> &
        Label<"ui-prompt-form-video-export-pixel_format-label"> &
        Placeholder<"ui-prompt-form-video-export-pixel_format-placeholder"> &
        Namespace<"ui-prompt-form-video-export-pixel_format-${identifier}-label">;
}

export const extension = {
    identifier: "dev.nbn.sim.export",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {commands, keybinds} = app;

        commands.push({
            identifier: "export.prompt.frames",
            is_visible: () => !!app.workspace?.preview,
            on_execute: this.command_prompt_frames.bind(this),
        });

        keybinds.push({
            identifier: "export.prompt.frames",
            binds: [["control", "shift", "f"]],
            on_bind: this.keybind_prompt_frames.bind(this),
        });

        commands.push({
            identifier: "export.prompt.video",
            is_visible: () => !!app.workspace?.preview,
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

        let export_configuration: IFramesExportConfiguration;
        try {
            export_configuration = (
                await prompts.prompt_form<IFramesExportConfiguration>({
                    is_dismissible: true,
                    title: "ui-prompt-form-frames-export-title",

                    type: typeOf<IFramesExportConfiguration>(),
                    model: {
                        // TODO: Make prompt configuration dynamic to support this as runtime validation
                        end: maxframes as number,
                    },
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
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
        const {agent, jobs, notifications, prompts, workspace} = app;
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

        const default_codec = await agent.encoding.get_default_codec();
        const default_codec_configuration = await agent.encoding.get_default_codec_configuration(
            default_codec
        );

        let export_configuration: IVideoExportConfiguration;
        try {
            export_configuration = (
                await prompts.prompt_form<IVideoExportConfiguration>({
                    is_dismissible: true,
                    title: "ui-prompt-form-video-export-title",

                    type: typeOf<IVideoExportConfiguration>(),
                    model: {
                        // TODO: Make prompt configuration dynamic to support this as runtime validation
                        end: maxframes as number,

                        codec: default_codec,
                        crf: default_codec_configuration.crf,
                        pixel_format: default_codec_configuration.pixel_format,
                    },
                })
            ).model;
        } catch (err) {
            if (err instanceof PromptDismissError) return;
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
