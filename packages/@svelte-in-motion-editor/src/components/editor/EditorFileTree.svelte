<script lang="ts">
    import {Box, Divider, Menu} from "@kahi-ui/framework";
    import {FileCode} from "lucide-svelte";
    import {onMount} from "svelte";

    import {debounce} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    const {preferences} = CONTEXT_APP.get()!;
    const editor = CONTEXT_EDITOR.get();
    const {identifier, storage} = CONTEXT_WORKSPACE.get()!;

    let files: string[] = [];

    const update = debounce(async () => {
        files = await storage.read_directory("/", {exclude_directories: true});
    }, 100);

    onMount(async () => {
        update();

        const destroy = await storage.watch_directory("/", {
            on_watch() {
                update();
            },
        });

        return () => destroy();
    });
</script>

<Box
    class="sim--editor-file-tree"
    palette="auto"
    width="small"
    hidden={!$preferences.ui.editor.file_tree.enabled}
>
    <Menu.Container sizing="nano" padding="medium">
        {#each files as file}
            <Menu.Anchor
                href="#/workspace/{identifier}{file}"
                active={file.slice(1) === editor?.file_path}
            >
                <FileCode size="1em" />

                {file.slice(1)}
            </Menu.Anchor>
        {/each}
    </Menu.Container>

    <Divider
        class="sim--editor-file-tree--divider"
        orientation="vertical"
        palette="inverse"
        margin="none"
    />
</Box>

<style>
    :global(.sim--editor-file-tree) {
        position: relative;

        grid-area: sidebar;
    }

    :global(.sim--editor-file-tree--divider) {
        position: absolute;

        top: 0;
        right: 0;
    }
</style>
