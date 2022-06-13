<script context="module" lang="ts">
    export const pattern: string = "/";
</script>

<script lang="ts">
    import {Button, Hero, Stack, Tile, Text} from "@kahi-ui/framework";
    import {PackageX} from "lucide-svelte";

    import AppLayout from "../components/app/AppLayout.svelte";

    import type {ICreateWorkspacePromptEvent} from "../lib/stores/prompts";

    import {CONTEXT_APP} from "../lib/app";
    import {is_prompt_dismiss_error} from "../lib/errors";

    const {prompts, workspaces} = CONTEXT_APP.get()!;

    async function on_create_click(event: MouseEvent): Promise<void> {
        let workspace_configuration: ICreateWorkspacePromptEvent;
        try {
            workspace_configuration = await prompts.prompt_create_workspace();
        } catch (err) {
            if (!is_prompt_dismiss_error(err)) return;
            throw err;
        }

        workspaces.push({
            name: workspace_configuration.name,
            identifier: crypto.randomUUID(),
            last_accessed: null,

            storage: {
                driver: "indexeddb",
            },
        });
    }

    $: recent_workspaces = $workspaces.slice().sort((workspace_a, workspace_b) => {
        if (workspace_a.last_accessed === null) return 1;
        if (workspace_b.last_accessed === null) return 0;

        const timestamp_a = Temporal.ZonedDateTime.from(workspace_a.last_accessed);
        const timestamp_b = Temporal.ZonedDateTime.from(workspace_b.last_accessed);

        const {seconds} = timestamp_a.until(timestamp_b, {
            largestUnit: "seconds",
            smallestUnit: "seconds",
        });

        return seconds > 0 ? 1 : seconds < 0 ? -1 : 0;
    });

    $: console.log({recent_workspaces});
</script>

<AppLayout>
    {#if recent_workspaces.length > 0}
        <Stack.Container spacing="small" padding="small">
            {#each recent_workspaces as workspace (workspace.identifier)}
                <Tile.Container sizing="nano" height="content-max">
                    <Tile.Section>
                        <Tile.Header>{workspace.name}</Tile.Header>
                        <Text is="small">
                            Last Accessed: {workspace.format_last_accessed()}
                        </Text>
                    </Tile.Section>

                    <Tile.Footer>
                        <Button
                            is="a"
                            href="#/workspace/{workspace.identifier}"
                            variation="clear"
                            palette="accent"
                            sizing="nano"
                        >
                            OPEN
                        </Button>
                    </Tile.Footer>
                </Tile.Container>
            {/each}
        </Stack.Container>

        <Button palette="affirmative" on:click={on_create_click}>Create Workspace</Button>
    {:else}
        <Hero.Container class="sim--app-dashboard">
            <Hero.Header>
                <PackageX size="1em" strokeWidth="1" />
            </Hero.Header>

            <Hero.Section>No available workspaces.</Hero.Section>

            <Hero.Footer>
                <Button palette="affirmative" on:click={on_create_click}>Create Workspace</Button>
            </Hero.Footer>
        </Hero.Container>
    {/if}
</AppLayout>

<style>
    :global(.sim--app-dashboard) {
        grid-area: content;
    }
</style>
