<script>
    import {routes} from "./lib/router";

    import * as Index from "./routes/index.svelte";
    import * as Editor from "./routes/editor.svelte";

    const [navigating, router] = routes(Editor, Index);
</script>

{#if $navigating}
    NAVIGATING!
{:else if $router}
    <svelte:component this={$router.Component} {...$router.props ?? {}} />
{/if}
