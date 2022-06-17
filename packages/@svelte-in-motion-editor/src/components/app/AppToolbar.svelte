<script context="module" lang="ts">
    const URL_DOCUMENTATION = "https://docs.sim.nbn.dev";
</script>

<script lang="ts">
    import {Dropdown, Menu} from "@kahi-ui/framework";
    //import {Archive, Download} from "lucide-svelte";
    import {get} from "svelte/store";

    import {download_buffer} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {CONTEXT_PREVIEW} from "../../lib/preview";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    import type {IExportVideoPromptEvent} from "../../lib/stores/prompts";

    import {is_prompt_dismiss_error} from "../../lib/util/errors";

    const {commands, notifications, prompts} = CONTEXT_APP.get()!;
    const editor = CONTEXT_EDITOR.get();
    const preview = CONTEXT_PREVIEW.get();
    const workspace = CONTEXT_WORKSPACE.get();

    async function on_export_video_click(event: MouseEvent): Promise<void> {
        const {file_path} = editor!;
        const {configuration, jobs} = workspace!;

        const {framerate, height, maxframes, width} = get(configuration);

        (document.activeElement as HTMLElement).blur();

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

        const job_identifier = jobs.queue({
            file: file_path,
            workspace: workspace!.identifier,

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
                height,
                width,
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
    }

    $: in_editor = !!editor;
    $: in_preview = !!preview;
    $: in_workspace = !!workspace;
</script>

<Menu.Container orientation="horizontal" sizing="nano">
    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>File</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled={!in_workspace}>New File</Menu.Button>
            <Menu.Button disabled={!in_workspace}>New from Sample</Menu.Button>

            <Menu.Heading />

            <Menu.Button disabled={!in_workspace}>Open Workspace</Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>Export</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("export.prompt.frames")}
            >
                Export Frames
            </Menu.Button>

            <Menu.Button disabled={!in_preview} on:click={on_export_video_click}>
                Export Video
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>View</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled={!in_workspace}>Errors</Menu.Button>
            <Menu.Button disabled={!in_workspace}>Jobs</Menu.Button>

            <Menu.Heading />

            <Menu.Button
                disabled={!in_workspace}
                on:click={(event) => commands.execute("editor.ui.file_tree.toggle")}
            >
                Toggle File Tree
            </Menu.Button>

            <Menu.Button
                disabled={!in_editor}
                on:click={(event) => commands.execute("editor.ui.script.toggle")}
            >
                Toggle Script Editor
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.checkerboard.toggle")}
            >
                Toggle Checkerboard
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.controls.toggle")}
            >
                Toggle Controls
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.timeline.toggle")}
            >
                Toggle Timeline
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.viewport.toggle")}
            >
                Toggle Viewport
            </Menu.Button>
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

            <Menu.Button on:click={(event) => commands.execute("application.prompt.about")}>
                About
            </Menu.Button>
        </Menu.Container>
    </Dropdown>
</Menu.Container>
