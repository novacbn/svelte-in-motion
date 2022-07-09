<script lang="ts">
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
    :global(.sim--editor-layout) {
        display: grid;

        grid-template-areas:
            "header header header"
            "sidebar script viewport"
            "sidebar script controls"
            "timeline timeline timeline"
            "status status status";

        grid-template-columns: max-content 1fr minmax(1fr, max-content);
        grid-template-rows: max-content 1fr max-content max-content max-content;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }
</style>
