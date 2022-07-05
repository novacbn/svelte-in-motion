<script context="module" lang="ts">
    const URL_DOCUMENTATION = "https://docs.sim.nbn.dev";
</script>

<script lang="ts">
    import {Dropdown, Menu} from "@kahi-ui/framework";
    //import {Archive, Download} from "lucide-svelte";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {CONTEXT_PREVIEW} from "../../lib/preview";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    const {commands} = CONTEXT_APP.get()!;
    const editor = CONTEXT_EDITOR.get();
    const preview = CONTEXT_PREVIEW.get();
    const workspace = CONTEXT_WORKSPACE.get();

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

            <Menu.Heading />

            <Menu.Button>New Workspace</Menu.Button>
            <Menu.Button>New Workspace from Sample</Menu.Button>
            <Menu.Button>Open Workspace</Menu.Button>
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

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("export.prompt.video")}
            >
                Export Video
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>View</Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button on:click={(event) => commands.execute("palette.prompt.commands")}>
                Command Palette
            </Menu.Button>

            <Menu.Heading />

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
