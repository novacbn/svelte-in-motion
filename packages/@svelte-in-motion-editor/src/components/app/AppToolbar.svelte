<script context="module" lang="ts">
    const URL_DOCUMENTATION = "https://docs.sim.nbn.dev";
</script>

<script lang="ts">
    import {Dropdown, Menu} from "@kahi-ui/framework";
    import {Archive, Download} from "lucide-svelte";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {is_prompt_dismiss_error} from "../../lib/errors";
    import {download_blob, download_buffer, zip_frames} from "../../lib/io";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    import {jobs} from "../../lib/stores/jobs";
    import type {IExportFramesPromptEvent, IExportVideoPromptEvent} from "../../lib/stores/prompts";
    import {renders} from "../../lib/stores/renders";

    const {notifications, prompts} = CONTEXT_APP.get()!;
    const editor = CONTEXT_EDITOR.get();
    const workspace = CONTEXT_WORKSPACE.get();

    async function on_about_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        try {
            await prompts.prompt_about();
        } catch (err) {}
    }

    async function on_export_frames_click(event: MouseEvent): Promise<void> {
        const {file_path} = editor!;
        const {configuration} = workspace!;

        (document.activeElement as HTMLElement).blur();

        let export_configuration: IExportFramesPromptEvent;
        try {
            export_configuration = await prompts.prompt_export_frames({
                frame_min: 0,
                frame_max: configuration.get("maxframes")!,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        const render_identifier = renders.queue({
            end: export_configuration.end,
            file: file_path,
            height: configuration.get("height")!,
            start: export_configuration.start,
            width: configuration.get("width")!,
        });

        const notification_identifier = renders.track(render_identifier, () =>
            renders.remove(render_identifier)
        );
        const frames = await renders.yield(render_identifier);

        notifications.update("identifier", notification_identifier, {
            icon: Archive,
            header: "Archiving Frames",
            dismissible: false,
        });

        const zip = await zip_frames(frames);

        notifications.update("identifier", notification_identifier, {
            icon: Download,
            header: "Downloading Archive",
            dismissible: true,
        });

        download_blob(
            zip,
            `svelte-in-motion.frames.${export_configuration.start}-${export_configuration.end}.${file_path}.zip`
        );
    }

    async function on_export_video_click(event: MouseEvent): Promise<void> {
        const {file_path} = editor!;
        const {configuration} = workspace!;

        (document.activeElement as HTMLElement).blur();

        let export_configuration: IExportVideoPromptEvent;
        try {
            export_configuration = await prompts.prompt_export_video({
                frame_min: 0,
                frame_max: configuration.get("maxframes")!,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        const job_identifier = jobs.queue({
            file: file_path,

            encode: {
                codec: export_configuration.codec,
                crf: export_configuration.crf,
                framerate: configuration.get("framerate")!,
                height: configuration.get("height")!,
                pixel_format: export_configuration.pixel_format,
                width: configuration.get("width")!,
            },

            render: {
                end: export_configuration.end,
                start: export_configuration.start,
                height: configuration.get("height")!,
                width: configuration.get("width")!,
            },
        });

        const notification_identifier = jobs.track(job_identifier, () =>
            jobs.remove(job_identifier)
        );
        const video = await jobs.yield(job_identifier);

        notifications.update("identifier", notification_identifier, {
            icon: Download,
            header: "Downloading Video",
            dismissible: true,
        });

        // HACK: / TODO: Update later to support variable video container format

        download_buffer(
            video,
            `svelte-in-motion.video.${export_configuration.start}-${export_configuration.end}.${file_path}.webm`,
            `video/webm`
        );
    }

    $: in_editor = !!editor;
    $: in_workspace = !!workspace;
</script>

<Menu.Container orientation="horizontal" sizing="nano">
    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>New</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled={!in_workspace}>New File</Menu.Button>
            <Menu.Button disabled={!in_workspace}>New from Sample</Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>Export</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled={!in_editor} on:click={on_export_frames_click}>
                Export Frames
            </Menu.Button>

            <Menu.Button disabled={!in_editor} on:click={on_export_video_click}>
                Export Video
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>View</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled={!in_workspace}>Jobs</Menu.Button>

            <Menu.Button>Toggle Zen Mode</Menu.Button>

            <Menu.Button disabled={!in_workspace}>Toggle File Tree</Menu.Button>
            <Menu.Button disabled={!in_workspace}>Toggle Script Editor</Menu.Button>

            <Menu.Button disabled={!in_editor}>Toggle Checkerboard</Menu.Button>
            <Menu.Button disabled={!in_editor}>Toggle Timeline</Menu.Button>
            <Menu.Button disabled={!in_editor}>Toggle Viewport</Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>Help</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button>Keybinds</Menu.Button>
            <Menu.Anchor href={URL_DOCUMENTATION} target="_blank" rel="noopener noreferrer">
                Documentation
            </Menu.Anchor>

            <Menu.Heading />
            <Menu.Button on:click={on_about_click}>About</Menu.Button>
        </Menu.Container>
    </Dropdown>
</Menu.Container>
