<script lang="ts">
    import AppHeader from "../app/AppHeader.svelte";
    import AppNotifications from "../app/AppNotifications.svelte";
    import AppPrompts from "../app/AppPrompts.svelte";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_PREVIEW} from "../../lib/preview";

    const {preferences} = CONTEXT_APP.get()!;
    const preview = CONTEXT_PREVIEW.get();

    $: has_preview =
        preview && ($preferences.ui.preview.controls || $preferences.ui.preview.viewport);
</script>

<div class="sim--editor-layout" data-has-preview={has_preview ? true : undefined}>
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

        grid-template-columns: max-content 1fr max-content;
        grid-template-rows: max-content 1fr max-content max-content max-content;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }

    :global(.sim--editor-layout[data-has-preview]) {
        grid-template-areas:
            "header header header"
            "sidebar script viewport"
            "sidebar script controls"
            "timeline timeline timeline"
            "status status status";
    }

    :global(.sim--editor-layout:not([data-has-preview])) {
        grid-template-areas:
            "header header"
            "sidebar script"
            "sidebar script"
            "timeline timeline"
            "status status";
    }
</style>
