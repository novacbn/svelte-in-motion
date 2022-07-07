<script context="module" lang="ts">
    import type {IAppContext} from "../lib/app";
    import type {ILoadCallback} from "../lib/router";

    export const pattern: string = "/";

    export const load: ILoadCallback<{app: IAppContext}> = async ({context}) => {
        const {app} = context;

        app.workspace = undefined;
    };
</script>

<script lang="ts">
    import {Button, Hero, Stack, Tile, Text} from "@kahi-ui/framework";
    //import {PackageX} from "lucide-svelte";

    import AppLayout from "../components/app/AppLayout.svelte";

    import {CONTEXT_APP} from "../lib/app";

    const {commands, translations, workspaces} = CONTEXT_APP.get()!;

    async function on_new_click(event: MouseEvent): Promise<void> {
        commands.execute("workspace.prompt.new");
    }

    $: recent_workspaces = $workspaces.workspaces.slice().sort((workspace_a, workspace_b) => {
        const {seconds} = workspace_a.accessed_at.until(workspace_b.accessed_at, {
            largestUnit: "seconds",
            smallestUnit: "seconds",
        });

        return seconds > 0 ? 1 : seconds < 0 ? -1 : 0;
    });
</script>

<AppLayout>
    {#if recent_workspaces.length > 0}
        <Stack.Container spacing="small" padding="small">
            {#each recent_workspaces as workspace (workspace.identifier)}
                <Tile.Container sizing="nano" height="content-max">
                    <Tile.Section>
                        <Tile.Header>{workspace.name}</Tile.Header>
                        <Text is="small">
                            {$translations.format(
                                "ui-view-dashboard-last_accessed_workspace-label",
                                {
                                    timestamp: workspace.format_accessed(),
                                }
                            )}
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
                            {$translations.format("ui-view-dashboard-open_workspace-label")}
                        </Button>
                    </Tile.Footer>
                </Tile.Container>
            {/each}
        </Stack.Container>

        <Button palette="affirmative" on:click={on_new_click}>
            {$translations.format("ui-view-dashboard-new_workspace-label")}
        </Button>
    {:else}
        <Hero.Container class="sim--app-dashboard">
            <Hero.Header>
                <!--
                    <PackageX size="1em" strokeWidth="1" />
                -->
                NOT FOUND
            </Hero.Header>

            <Hero.Section>
                {$translations.format("ui-view-dashboard-no_available_workspaces-label")}
            </Hero.Section>

            <Hero.Footer>
                <Button palette="affirmative" on:click={on_new_click}>
                    {$translations.format("ui-view-dashboard-new_workspace-label")}
                </Button>
            </Hero.Footer>
        </Hero.Container>
    {/if}
</AppLayout>

<style>
    :global(.sim--app-dashboard) {
        grid-area: content;
    }
</style>
