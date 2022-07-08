<script>
    import AppHeader from "../app/AppHeader.svelte";
    import AppNotifications from "../app/AppNotifications.svelte";
    import AppPrompts from "../app/AppPrompts.svelte";
</script>

<div class="sim--editor-layout">
    <slot />

    <!-- NOTE: This order is specific so they layer properly -->

    <AppHeader />
    <AppNotifications />
    <AppPrompts />
</div>

<style>
    :global(html, body) {
        width: 100%;
        height: 100%;

        overflow: hidden;
    }

    :global(body) {
        margin: 0;
    }

    :global(.sim--editor-layout) {
        display: grid;

        grid-template-areas:
            "header header header"
            "sidebar script viewport"
            "sidebar script controls"
            "timeline timeline timeline";

        grid-template-columns: max-content max-content 1fr;
        grid-template-rows: max-content 1fr max-content max-content;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }
</style>
