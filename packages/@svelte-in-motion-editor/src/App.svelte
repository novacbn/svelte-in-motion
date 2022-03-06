<script>
    import {routes} from "./lib/router";

    import * as Index from "./routes/index.svelte";

    const [navigating, router] = routes(Index);
</script>

{#if $navigating}
    NAVIGATING!
{:else if $router}
    <svelte:component this={$router.Component} {...$router.props ?? {}} />
{/if}
