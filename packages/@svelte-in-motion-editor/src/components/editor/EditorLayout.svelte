<script lang="ts">
    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_PREVIEW} from "../../lib/preview";

    import AppHeader from "../app/AppHeader.svelte";
    import AppNotifications from "../app/AppNotifications.svelte";
    import AppPrompts from "../app/AppPrompts.svelte";

    const {preferences} = CONTEXT_APP.get()!;
    const preview = CONTEXT_PREVIEW.get();

    $: in_preview =
        preview &&
        ($preferences.ui.preview.controls.enabled || $preferences.ui.preview.viewport.enabled);
    $: in_script = $preferences.ui.editor.script.enabled;
</script>

<div
    class="sim--editor-layout"
    data-in-preview={in_preview ? true : undefined}
    data-in-script={in_script ? true : undefined}
>
    <slot />

    <!-- NOTE: This order is specific so they layer properly -->

    <AppHeader />
    <AppNotifications />
    <AppPrompts />
</div>

<style>
    :global(.sim--editor-layout) {
        display: grid;

        grid-template-columns: auto minmax(65ch, 1fr) 1fr;
        grid-template-rows: auto 1fr auto auto auto;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }

    :global(.sim--editor-layout[data-in-script]) {
        grid-template-areas:
            "header header"
            "sidebar script"
            "sidebar script"
            "timeline timeline"
            "status status";

        grid-template-columns: auto 1fr;
    }

    :global(.sim--editor-layout[data-in-preview]) {
        grid-template-areas:
            "header header"
            "sidebar viewport"
            "sidebar controls"
            "timeline timeline"
            "status status";

        grid-template-columns: auto 1fr;
    }

    :global(.sim--editor-layout[data-in-preview][data-in-script]) {
        grid-template-areas:
            "header header header"
            "sidebar script viewport"
            "sidebar script controls"
            "timeline timeline timeline"
            "status status status";

        grid-template-columns: auto minmax(65ch, 1fr) 1fr;
    }
</style>
