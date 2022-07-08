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
    import {Anchor, Badge, Heading, Spacer, Stack, Text} from "@kahi-ui/framework";
    //import {PackageX} from "lucide-svelte";

    import AppLayout from "../components/app/AppLayout.svelte";
    import AppStatus from "../components/app/AppStatus.svelte";

    import {CONTEXT_APP} from "../lib/app";

    const {commands, translations, workspaces} = CONTEXT_APP.get()!;

    function on_new_click(event: MouseEvent): void {
        event.preventDefault();

        commands.execute("workspace.prompt.new");
    }

    function on_recent_click(event: MouseEvent): void {
        event.preventDefault();

        commands.execute("workspace.prompt.open_recent");
    }

    function on_template_click(event: MouseEvent): void {
        event.preventDefault();

        commands.execute("workspace.prompt.new_from_template");
    }

    $: recent_workspaces = $workspaces.workspaces
        .slice()
        .sort((workspace_a, workspace_b) => {
            const {seconds} = workspace_a.accessed_at.until(workspace_b.accessed_at, {
                largestUnit: "seconds",
                smallestUnit: "seconds",
            });

            return seconds < 0 ? -1 : 0;
        })
        .slice(0, 5);
</script>

<AppLayout>
    <Stack.Container
        class="sim--app-dashboard"
        spacing="large"
        alignment_x="left"
        alignment_y="center"
        padding_x="massive"
    >
        <Heading>
            {$translations.format("ui-view-dashboard-brand-label")}
        </Heading>

        <div>
            <Heading is="h2" margin_bottom="medium">
                {$translations.format("ui-view-dashboard-start-label")}
            </Heading>

            <Stack.Container alignment_x="left">
                <Anchor href="#" palette="accent" on:click={on_new_click}>
                    {$translations.format("ui-view-dashboard-new_workspace-label")}
                </Anchor>

                <Anchor href="#" palette="accent" on:click={on_template_click}>
                    {$translations.format("ui-view-dashboard-new_workspace_from_template-label")}
                </Anchor>

                <Anchor href="#" palette="accent" on:click={on_recent_click}>
                    {$translations.format("ui-view-dashboard-open_recent_workspace-label")}
                </Anchor>
            </Stack.Container>
        </div>

        {#if recent_workspaces.length > 0}
            <div>
                <Heading is="h2" margin_bottom="medium">
                    {$translations.format("ui-view-dashboard-recent-label")}
                </Heading>

                <Stack.Container max_width="content-max">
                    {#each recent_workspaces as workspace (workspace.identifier)}
                        <Stack.Container
                            orientation="horizontal"
                            alignment_y="center"
                            spacing="medium"
                        >
                            <Anchor href="#/workspace/{workspace.identifier}" palette="accent">
                                {workspace.name}
                            </Anchor>

                            <Spacer />

                            <Text sizing="nano">
                                <Badge radius="tiny">
                                    {workspace.format_accessed()}
                                </Badge>
                            </Text>
                        </Stack.Container>
                    {/each}

                    {#if $workspaces.workspaces.length > recent_workspaces.length}
                        <Anchor
                            href="#"
                            palette="accent"
                            max_width="content-max"
                            on:click={on_recent_click}
                        >
                            {$translations.format("ui-view-dashboard-more-label")}
                        </Anchor>
                    {/if}
                </Stack.Container>
            </div>
        {/if}
    </Stack.Container>

    <AppStatus />
</AppLayout>

<style>
    :global(.sim--app-dashboard) {
        grid-area: body;
    }
</style>
