<script lang="ts">
    import {Box, Divider, Stack, Text} from "@kahi-ui/framework";

    import AppToolbar from "./AppToolbar.svelte";
</script>

<Box class="sim--app-header" palette="auto">
    <Stack.Container
        orientation="horizontal"
        alignment_y="center"
        spacing="medium"
        padding_x="medium"
        padding_top="tiny"
    >
        <Text is="strong" sizing="tiny">Svelte-In-Motion</Text>

        <!--
            <AppToolbar />
        -->
    </Stack.Container>

    <Divider palette="inverse" margin="none" margin_top="tiny" />
</Box>

<style>
    :global(.sim--app-header) {
        grid-area: header;
    }
</style>
