<script lang="ts">
    import {Box, Code, Overlay, Text} from "@kahi-ui/framework";

    import {CONTEXT_EDITOR} from "../lib/editor";

    const {errors} = CONTEXT_EDITOR.get()!;
</script>

<Overlay.Container class="sim--errors" hidden={!$errors}>
    <Overlay.Section alignment_x="stretch" alignment_y="top">
        <Box palette="negative" padding="small">
            <Text is="strong">{$errors?.name ?? ""}</Text>: <Code>{$errors?.message ?? ""}</Code>
        </Box>
    </Overlay.Section>
</Overlay.Container>

<style>
    :global(.sim--errors) {
        position: absolute;
    }
</style>
