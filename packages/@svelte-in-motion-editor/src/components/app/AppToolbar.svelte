<script context="module" lang="ts">
    const URL_DOCUMENTATION = "https://github.com/novacbn/svelte-in-motion/blob/main/API.md";
</script>

<script lang="ts">
    import {Dropdown, Menu} from "@kahi-ui/framework";
    import {Archive, Download} from "lucide-svelte";

    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {is_prompt_dismiss_error} from "../../lib/errors";
    import {download_blob, download_buffer, zip_frames} from "../../lib/io";
    import {jobs} from "../../lib/stores/jobs";
    import {notifications} from "../../lib/stores/notifications";

    import type {IExportFramesPromptEvent, IExportVideoPromptEvent} from "../../lib/stores/prompts";
    import {prompts} from "../../lib/stores/prompts";
    import {renders} from "../../lib/stores/renders";

    const {framerate, height, maxframes, path, width} = CONTEXT_EDITOR.get()!;

    async function on_about_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        try {
            await prompts.prompt_about();
        } catch (err) {}
    }

    async function on_export_frames_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        let export_configuration: IExportFramesPromptEvent;
        try {
            export_configuration = await prompts.prompt_export_frames({
                frame_min: 0,
                frame_max: $maxframes,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        const render_identifier = renders.queue({
            end: export_configuration.end,
            file: $path,
            height: $height,
            start: export_configuration.start,
            width: $width,
        });

        const notification_identifier = renders.track(render_identifier, () =>
            renders.remove(render_identifier)
        );
        const frames = await renders.yield(render_identifier);

        notifications.update(notification_identifier, {
            icon: Archive,
            header: "Archiving Frames",
            dismissible: false,
        });

        const zip = await zip_frames(frames);

        notifications.update(notification_identifier, {
            icon: Download,
            header: "Downloading Archive",
            dismissible: true,
        });

        download_blob(
            zip,
            `svelte-in-motion.frames.${export_configuration.start}-${export_configuration.end}.${$path}.zip`
        );
    }

    async function on_export_video_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        let export_configuration: IExportVideoPromptEvent;
        try {
            export_configuration = await prompts.prompt_export_video({
                frame_min: 0,
                frame_max: $maxframes,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        const job_identifier = jobs.queue({
            file: $path,

            encode: {
                codec: export_configuration.codec,
                crf: export_configuration.crf,
                framerate: $framerate,
                height: $height,
                pixel_format: export_configuration.pixel_format,
                width: $width,
            },

            render: {
                end: export_configuration.end,
                start: export_configuration.start,
                height: $height,
                width: $width,
            },
        });

        const notification_identifier = jobs.track(job_identifier, () =>
            jobs.remove(job_identifier)
        );
        const video = await jobs.yield(job_identifier);

        notifications.update(notification_identifier, {
            icon: Download,
            header: "Downloading Video",
            dismissible: true,
        });

        // HACK: / TODO: Update later to support variable video container format

        download_buffer(
            video,
            `svelte-in-motion.video.${export_configuration.start}-${export_configuration.end}.${$path}.webm`,
            `video/webm`
        );
    }
</script>

<Menu.Container orientation="horizontal" sizing="nano">
    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>New</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled>New File</Menu.Button>
            <Menu.Button disabled>New from Sample</Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>Export</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button on:click={on_export_frames_click}>Export Frames</Menu.Button>
            <Menu.Button on:click={on_export_video_click}>Export Video</Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>View</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled>Jobs</Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>Help</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled>Keybinds</Menu.Button>
            <Menu.Anchor href={URL_DOCUMENTATION} target="_blank" rel="noopener noreferrer">
                Documentation
            </Menu.Anchor>

            <Menu.Heading />
            <Menu.Button on:click={on_about_click}>About</Menu.Button>
        </Menu.Container>
    </Dropdown>
</Menu.Container>
