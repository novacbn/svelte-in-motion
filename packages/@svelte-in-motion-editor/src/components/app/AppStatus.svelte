<script lang="ts">
    import {Box, Stack} from "@kahi-ui/framework";
</script>

<Box class="sim--app-status" palette="accent" padding_x="tiny" padding_y="nano" height="icon-tiny">
    <Stack.Container orientation="horizontal" spacing="small" alignment_y="center" height="100">
        <slot />
    </Stack.Container>
</Box>

<style>
    :global(.sim--app-status) {
        grid-area: status;
    }
</style>
