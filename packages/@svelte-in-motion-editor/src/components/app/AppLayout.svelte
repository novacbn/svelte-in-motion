<script lang="ts">
    import AppHeader from "./AppHeader.svelte";
    import AppNotifications from "./AppNotifications.svelte";
    import AppPrompts from "./AppPrompts.svelte";
</script>

<div class="sim--app-layout">
    <slot />

    <!-- NOTE: This order is specific so they layer properly -->

    <AppNotifications />
    <AppHeader />
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

    :global(.sim--app-layout) {
        display: grid;

        grid-template-areas:
            "header"
            "content";

        grid-template-columns: 1fr;
        grid-template-rows: max-content 1fr;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }
</style>
