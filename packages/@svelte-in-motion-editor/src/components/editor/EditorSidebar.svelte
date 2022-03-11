<script lang="ts">
    import {Box, Divider, Menu} from "@kahi-ui/framework";
    import {FileCode} from "lucide-svelte";
    import {onMount} from "svelte";

    import {debounce} from "@svelte-in-motion/core";

    import {CONTEXT_EDITOR} from "../../lib/stores/editor";
    import {STORAGE_FILESYSTEM, STORAGE_USER} from "../../lib/storage";

    const {file: file_context, zen_mode} = CONTEXT_EDITOR.get()!;

    let files: string[] = [];

    const update = debounce(async () => {
        files = await STORAGE_FILESYSTEM.getKeys("filesystem:user:");

        files = files
            .filter((file, index) => file.toLowerCase().endsWith(".svelte"))
            .map((file, index) => file.replaceAll("filesystem:user:", ""));
    }, 100);

    onMount(() => {
        update();

        STORAGE_USER.watch((event, key) => update());
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

                Sample.svelte
            </Menu.Anchor>
        {/each}
    </Menu.Container>

    <hr
        class="divider sim--editor-sidebar--divider"
        data-orientation="vertical"
        data-palette="inverse"
        data-margin="none"
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
