<script context="module" lang="ts">
    const URL_DOCUMENTATION = "https://github.com/novacbn/svelte-in-motion/blob/main/API.md";
</script>

<script lang="ts">
    import {Box, Divider, Dropdown, Menu, Stack, Text} from "@kahi-ui/framework";

    import {CONTEXT_EDITOR} from "../../lib/editor";

    const {zen_mode} = CONTEXT_EDITOR.get()!;
</script>

<Box class="sim--app-header" palette="auto" style="display:{$zen_mode ? 'none' : 'block'}">
    <Stack.Container
        orientation="horizontal"
        alignment_y="center"
        spacing="medium"
        padding_x="medium"
        padding_top="tiny"
    >
        <Text is="strong" sizing="tiny">Svelte-In-Motion</Text>

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
                    <Menu.Button disabled>Export Frames</Menu.Button>
                    <Menu.Button disabled>Export Video</Menu.Button>
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
                    <Menu.Button disabled>About</Menu.Button>
                </Menu.Container>
            </Dropdown>
        </Menu.Container>
    </Stack.Container>

    <Divider palette="inverse" margin="none" margin_top="tiny" />
</Box>

<style>
    :global(.sim--app-header) {
        grid-area: header;
    }
</style>
