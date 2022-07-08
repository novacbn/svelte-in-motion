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

    const {commands, translations} = CONTEXT_APP.get()!;
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
                {$translations.format("ui-app-toolbar-menu-file-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button disabled>
                {$translations.format("ui-app-toolbar-option-new_file-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button disabled>
                {$translations.format("ui-app-toolbar-option-new_workspace-label")}
            </Menu.Button>

            <Menu.Button disabled>
                {$translations.format("ui-app-toolbar-option-new_workspace_from_template-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button on:click={(event) => commands.execute("workspace.prompt.open_recent")}>
                {$translations.format("ui-app-toolbar-option-open_recent_workspace-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>
                {$translations.format("ui-app-toolbar-menu-export-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("export.prompt.frames")}
            >
                {$translations.format("ui-app-toolbar-option-export_frames-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("export.prompt.video")}
            >
                {$translations.format("ui-app-toolbar-option-export_video-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>
                {$translations.format("ui-app-toolbar-menu-view-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Button on:click={(event) => commands.execute("palette.prompt.commands")}>
                {$translations.format("ui-app-toolbar-option-command-palette-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button disabled>
                {$translations.format("ui-app-toolbar-option-errors-label")}
            </Menu.Button>

            <Menu.Button disabled>
                {$translations.format("ui-app-toolbar-option-jobs-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button
                disabled={!in_workspace}
                on:click={(event) => commands.execute("editor.ui.file_tree.toggle")}
            >
                {$translations.format("ui-app-toolbar-option-toggle_file_tree-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_editor}
                on:click={(event) => commands.execute("editor.ui.script.toggle")}
            >
                {$translations.format("ui-app-toolbar-option-toggle_script_editor-label")}
            </Menu.Button>

            <Menu.Heading />

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.checkerboard.toggle")}
            >
                {$translations.format("ui-app-toolbar-option-toggle_checkerboard-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.controls.toggle")}
            >
                {$translations.format("ui-app-toolbar-option-toggle_controls-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.timeline.toggle")}
            >
                {$translations.format("ui-app-toolbar-option-toggle_timeline-label")}
            </Menu.Button>

            <Menu.Button
                disabled={!in_preview}
                on:click={(event) => commands.execute("preview.ui.viewport.toggle")}
            >
                {$translations.format("ui-app-toolbar-option-toggle_viewport-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>

    <Dropdown variation="control">
        <svelte:fragment slot="activator">
            <Menu.Button>
                {$translations.format("ui-app-toolbar-menu-help-label")}
            </Menu.Button>
        </svelte:fragment>

        <Menu.Container sizing="nano">
            <Menu.Anchor href={URL_DOCUMENTATION} target="_blank" rel="noopener noreferrer">
                {$translations.format("ui-app-toolbar-option-documentation-label")}
            </Menu.Anchor>

            <Menu.Heading />

            <Menu.Button on:click={(event) => commands.execute("application.prompt.about")}>
                {$translations.format("ui-app-toolbar-option-about-label")}
            </Menu.Button>
        </Menu.Container>
    </Dropdown>
</Menu.Container>
