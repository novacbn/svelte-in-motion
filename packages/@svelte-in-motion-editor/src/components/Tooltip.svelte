<script lang="ts">
    import type {
        PROPERTY_ALIGNMENT_X,
        PROPERTY_ALIGNMENT_Y,
        PROPERTY_PLACEMENT,
    } from "@kahi-ui/framework";
    import {Box, Popover, Text} from "@kahi-ui/framework";

    export let placement: PROPERTY_PLACEMENT | undefined = undefined;

    export let alignment_x: PROPERTY_ALIGNMENT_X | undefined = undefined;
    export let alignment_y: PROPERTY_ALIGNMENT_Y | undefined = undefined;
</script>

<Popover.Container variation="tooltip">
    <slot name="activator" />

    <Popover.Section animation="fade" spacing="small" {placement} {alignment_x} {alignment_y}>
        <Box elevation="medium" variation="borders" radius="nano" padding="tiny">
            <Text sizing="nano">
                <slot />
            </Text>
        </Box>
    </Popover.Section>
</Popover.Container>
