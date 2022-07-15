<script lang="ts">
    import {Router} from "@novacbn/svelte-router";

    import * as DashboardRoute from "../routes/dashboard.svelte";
    import * as WorkspaceRoute from "../routes/workspace.svelte";

    import type {IAppContext} from "./app";
    import {CONTEXT_APP} from "./app";

    export let app: IAppContext;

    $: services = {[CONTEXT_APP.key]: app};
</script>

<svelte:body
    on:keydown={(event) => app.keybinds.execute(event, true)}
    on:keyup={(event) => app.keybinds.execute(event, false)} />

<Router.Provider {services}>
    <Router.Route definition={DashboardRoute} />
    <Router.Route definition={WorkspaceRoute} />

    <Router.Fallback>
        <div class="sim--splash">Svelte-In-Motion</div>
    </Router.Fallback>
</Router.Provider>

<style>
    .sim--splash {
        display: flex;
        position: fixed;

        align-items: center;
        justify-content: center;

        inset: 0;
    }
</style>
