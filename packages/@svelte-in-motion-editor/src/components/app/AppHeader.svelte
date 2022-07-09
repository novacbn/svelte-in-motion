<script lang="ts">
    import {Anchor, Box, Divider, Stack, Text} from "@kahi-ui/framework";

    import {CONTEXT_APP} from "../../lib/app";

    const {commands} = CONTEXT_APP.get()!;

    function on_palette_click(event: MouseEvent): void {
        event.preventDefault();

        commands.execute("palette.prompt.commands");
    }
</script>

<Box class="sim--app-header" palette="auto">
    <Stack.Container
        orientation="horizontal"
        alignment_y="center"
        spacing="medium"
        padding_x="medium"
        padding_top="tiny"
    >
        <Text is="strong" sizing="tiny">
            <Anchor href="#" on:click={on_palette_click}>Svelte-In-Motion</Anchor>
        </Text>
    </Stack.Container>

    <Divider palette="inverse" margin="none" margin_top="tiny" />
</Box>

<style>
    :global(.sim--app-header) {
        grid-area: header;
    }
</style>
