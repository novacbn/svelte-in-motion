<script>
    import AppLayout from "../app/AppLayout.svelte";
</script>

<AppLayout>
    <div class="sim--editor-layout">
        <slot />
    </div>
</AppLayout>

<style>
    :global(.sim--editor-layout) {
        display: grid;

        grid-template-areas:
            "sidebar script viewport"
            "sidebar script controls"
            "timeline timeline timeline";

        grid-template-columns: max-content max-content 1fr;
        grid-template-rows: 1fr max-content max-content;
    }
</style>
