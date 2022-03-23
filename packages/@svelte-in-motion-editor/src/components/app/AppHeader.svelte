<script context="module" lang="ts">
    const URL_DOCUMENTATION = "https://github.com/novacbn/svelte-in-motion/blob/main/API.md";
</script>

<script lang="ts">
    import {Box, Divider, Dropdown, Menu, Stack, Text} from "@kahi-ui/framework";

    import {CONTEXT_EDITOR} from "../../lib/editor";
    import {is_prompt_dismiss_error} from "../../lib/errors";

    import type {IExportFramesPromptEvent, IExportVideoPromptEvent} from "../../lib/stores/prompts";
    import {prompts} from "../../lib/stores/prompts";

    const {configuration, zen_mode} = CONTEXT_EDITOR.get()!;

    async function on_about_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        try {
            await prompts.prompt_about();
        } catch (err) {}
    }

    async function on_export_frames_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        let result: IExportFramesPromptEvent;
        try {
            result = await prompts.prompt_export_frames({
                frame_min: 0,
                frame_max: $configuration.maxframes,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        console.log(result);
    }

    async function on_export_video_click(event: MouseEvent): Promise<void> {
        (document.activeElement as HTMLElement).blur();

        let result: IExportVideoPromptEvent;
        try {
            result = await prompts.prompt_export_video({
                frame_min: 0,
                frame_max: $configuration.maxframes,
            });
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        console.log(result);
    }
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
    </Stack.Container>

    <Divider palette="inverse" margin="none" margin_top="tiny" />
</Box>

<style>
    :global(.sim--app-header) {
        grid-area: header;
    }
</style>
