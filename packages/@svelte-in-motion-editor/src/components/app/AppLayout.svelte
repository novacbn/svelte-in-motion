<script lang="ts">
    import AppHeader from "./AppHeader.svelte";
    import AppNotifications from "./AppNotifications.svelte";
    import AppPrompts from "./AppPrompts.svelte";
</script>

<div class="sim--app-layout">
    <slot />

    <!-- NOTE: This order is specific so they layer properly -->

    <AppHeader />
    <AppNotifications />
    <AppPrompts />
</div>

<style>
    :global(.sim--app-layout) {
        display: grid;

        grid-template-areas:
            "header"
            "body"
            "status";

        grid-template-columns: 1fr;
        grid-template-rows: max-content 1fr max-content;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }
</style>
