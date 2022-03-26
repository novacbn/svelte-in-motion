<script lang="ts">
    import {Box, Center, Dot, Ellipsis, Overlay} from "@kahi-ui/framework";

    export let hidden: boolean = false;
</script>

<Overlay.Container class="loader" {hidden}>
    <Overlay.Section>
        <Box size="100">
            <Center height="100">
                <Ellipsis animation="bounce" iterations="5">
                    <Dot palette="inverse" />
                </Ellipsis>
            </Center>
        </Box>
    </Overlay.Section>
</Overlay.Container>

<style>
    :global(.loader) {
        position: absolute;
    }
</style>
