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

    const {commands, translate} = CONTEXT_APP.get()!;
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
            <Menu.Button>
                {$translate("ui-app-toolbar-menu-file-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled>
                {$translate("ui-app-toolbar-option-new_file-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button disabled>
                {$translate("ui-app-toolbar-option-new_workspace-label")}
            </Menu.Button>

            <Menu.Button disabled>
                {$translate("ui-app-toolbar-option-new_workspace_from_template-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button disabled>
                {$translate("ui-app-toolbar-option-open_workspace-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>
                {$translate("ui-app-toolbar-menu-export-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("export.prompt.frames")}
            >
                {$translate("ui-app-toolbar-option-export_frames-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("export.prompt.video")}
            >
                {$translate("ui-app-toolbar-option-export_video-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>
                {$translate("ui-app-toolbar-menu-view-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button on:click={(event) => commands.execute("palette.prompt.commands")}>
                {$translate("ui-app-toolbar-option-command-palette-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button disabled>
                {$translate("ui-app-toolbar-option-errors-label")}
            </Menu.Button>

            <Menu.Button disabled>
                {$translate("ui-app-toolbar-option-jobs-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button
                disabled={!in_workspace}
                on:click={(event) => commands.execute("editor.ui.file_tree.toggle")}
            >
                {$translate("ui-app-toolbar-option-toggle_file_tree-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_editor}
                on:click={(event) => commands.execute("editor.ui.script.toggle")}
            >
                {$translate("ui-app-toolbar-option-toggle_script_editor-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.checkerboard.toggle")}
            >
                {$translate("ui-app-toolbar-option-toggle_checkerboard-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.controls.toggle")}
            >
                {$translate("ui-app-toolbar-option-toggle_controls-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.timeline.toggle")}
            >
                {$translate("ui-app-toolbar-option-toggle_timeline-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.viewport.toggle")}
            >
                {$translate("ui-app-toolbar-option-toggle_viewport-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>
                {$translate("ui-app-toolbar-menu-help-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Anchor href={URL_DOCUMENTATION} target="_blank" rel="noopener noreferrer">
                {$translate("ui-app-toolbar-option-documentation-label")}
            </Menu.Anchor>

            <Menu.Heading />

            <Menu.Button on:click={(event) => commands.execute("application.prompt.about")}>
                {$translate("ui-app-toolbar-option-about-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>
</Menu.Container>
