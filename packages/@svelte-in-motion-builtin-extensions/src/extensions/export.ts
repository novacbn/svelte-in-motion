import {get} from "svelte/store";

import type {IAppContext, IKeybindEvent} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";
import {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import {Default, Minimum} from "@svelte-in-motion/type";
import {typeOf} from "@svelte-in-motion/type";
import {PromptDismissError, download_blob, download_buffer} from "@svelte-in-motion/utilities";

import {NoEditorUserError, NoPreviewUserError, NoWorkspaceUserError} from "../util/errors";
import {zip_frames} from "../util/io";

interface FramesExport {
    start: number & Default<0> & Minimum<0>;

    end: number & Default<0> & Minimum<0>;
}

interface VideoExport {
    start: number & Default<0> & Minimum<0>;

    end: number & Default<0> & Minimum<0>;

    codec: ICodecNames;

    crf: number & Minimum<0>;

    pixel_format: IPixelFormatNames;
}

export const EXTENSION_EXPORT = define_extension({
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

        if (!workspace) throw new NoWorkspaceUserError();

        const {configuration, editor, preview} = workspace;

        if (!editor) throw new NoEditorUserError();
        if (!preview) throw new NoPreviewUserError();

        const {maxframes} = get(configuration);

        let result: FramesExport;
        try {
            result = (
                await prompts.prompt_form<FramesExport>({
                    is_dismissible: true,

                    type: typeOf<FramesExport>(),
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
        const $file_path = get(file_path);

        const render_identifier = await renders.queue({
            workspace: workspace.identifier,
            file: $file_path,

            end: result.end,
            start: result.start,
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
            `svelte-in-motion.frames.${result.start}-${result.end}.${file_path}.zip`
        );
    },

    async command_prompt_video(app: IAppContext) {
        const {agent, jobs, notifications, prompts, workspace} = app;

        if (!workspace) throw new NoWorkspaceUserError();

        const {configuration, editor, preview} = workspace;

        if (!editor) throw new NoEditorUserError();
        if (!preview) throw new NoPreviewUserError();

        const {file_path} = editor;
        const $file_path = get(file_path);

        const {framerate, height, maxframes, width} = get(configuration);

        const default_codec = await agent.encoding.get_default_codec();
        const default_codec_configuration = await agent.encoding.get_default_codec_configuration(
            default_codec
        );

        let result: VideoExport;
        try {
            result = (
                await prompts.prompt_form<VideoExport>({
                    is_dismissible: true,

                    type: typeOf<VideoExport>(),
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
            file: $file_path,
            workspace: workspace.identifier,

            encode: {
                codec: result.codec,
                crf: result.crf,
                framerate,
                height,
                pixel_format: result.pixel_format,
                width,
            },

            render: {
                end: result.end,
                start: result.start,
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
            `svelte-in-motion.video.${result.start}-${result.end}.${file_path}.webm`,
            `video/webm`
        );
    },

    keybind_prompt_frames(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.preview) this.command_prompt_frames(app);
    },

    keybind_prompt_video(app: IAppContext, event: IKeybindEvent) {
        if (event.active && app.workspace?.preview) this.command_prompt_video(app);
    },
});
