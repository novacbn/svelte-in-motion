<script lang="ts">
    import {Box, Divider, Menu} from "@kahi-ui/framework";
    import {FileCode} from "lucide-svelte";
    import {onMount} from "svelte";

    import {debounce} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {STORAGE_USER} from "../../lib/storage";

    const {file: file_context, zen_mode} = CONTEXT_EDITOR.get()!;

    let files: string[] = [];

    const update = debounce(async () => {
        files = await STORAGE_USER.read_directory("/", {exclude_directories: true});
    }, 100);

    onMount(async () => {
        update();

        const destroy = await STORAGE_USER.watch_directory("/", {
            on_watch() {
                update();
            },
        });

        return () => destroy();
    });
</script>

<Box
    class="sim--editor-sidebar"
    palette="auto"
    width="small"
    style="display:{$zen_mode ? 'none' : 'block'}"
>
    <Menu.Container sizing="nano" padding="medium">
        {#each files as file}
            <Menu.Anchor href="#/{file}" active={file === file_context}>
                <FileCode size="1em" />

                {file}
            </Menu.Anchor>
        {/each}
    </Menu.Container>

    <Divider
        class="sim--editor-sidebar--divider"
        orientation="vertical"
        palette="inverse"
        margin="none"
    />
</Box>

<style>
    :global(.sim--editor-sidebar) {
        position: relative;

        grid-area: sidebar;
    }

    :global(.sim--editor-sidebar--divider) {
        position: absolute;

        top: 0;
        right: 0;
    }
</style>
