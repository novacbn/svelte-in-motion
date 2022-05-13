<script lang="ts">
    import {Button, Overlay, Tile, Text} from "@kahi-ui/framework";
    import {X} from "lucide-svelte";

    import {CONTEXT_APP} from "../../lib/app";

    import type {INotification} from "../../lib/stores/notifications";

    const {notifications} = CONTEXT_APP.get()!;

    function on_dismiss_click(event: MouseEvent, notification: INotification): void {
        notifications.remove("identifier", notification.identifier);
    }
</script>

<Overlay.Container class="sim--app-notifications">
    <Overlay.Section
        spacing="small"
        alignment_x="right"
        alignment_y="bottom"
        padding_bottom="small"
        padding_right="small"
    >
        {#each $notifications as notification (notification.identifier)}
            <Tile.Container
                palette={notification.palette}
                elevation="medium"
                width="content-max"
                sizing="nano"
            >
                {#if notification.icon}
                    <Tile.Figure>
                        <svelte:component this={notification.icon} />
                    </Tile.Figure>
                {/if}

                <Tile.Section>
                    <Tile.Header>{notification.header}</Tile.Header>

                    {#if notification.text}
                        <Text>
                            {notification.text}
                        </Text>
                    {/if}
                </Tile.Section>

                {#if notification.dismissible}
                    <Tile.Footer>
                        <Button
                            palette="negative"
                            variation="clear"
                            sizing="tiny"
                            on:click={(event) => on_dismiss_click(event, notification)}
                        >
                            <X size="1em" />
                        </Button>
                    </Tile.Footer>
                {/if}
            </Tile.Container>
        {/each}
    </Overlay.Section>
</Overlay.Container>
