<script lang="ts">
    import {onMount} from "svelte";

    import {advance} from "@svelte-in-motion/core";

    import {dispatch, subscribe} from "../../lib/messages";
    import {CONTEXT_EDITOR} from "../../lib/stores/editor";
    import type {
        IPreviewFrameMessage,
        IPreviewPlayingMessage,
        IPreviewReadyMessage,
    } from "../../lib/types/preview";

    const {file, frame, framerate, maxframes, playing} = CONTEXT_EDITOR.get()!;

    const _advance = advance({frame, framerate, maxframes, playing});

    let iframe_element: HTMLIFrameElement | undefined;

    let _ready: boolean = false;

    onMount(() => {
        if (!iframe_element) {
            throw ReferenceError("bad mount to 'EditorRender' (could not query iframe)");
        }

        const destroy = subscribe<IPreviewReadyMessage>(
            "PREVIEW_READY",
            () => (_ready = true),
            iframe_element
        );

        return () => destroy();
    });

    // HACK: Need to subscribe to it, so it'll run
    $_advance;

    $: if (iframe_element && _ready)
        dispatch<IPreviewFrameMessage>("PREVIEW_FRAME", {frame: $frame}, iframe_element);

    $: if (iframe_element && _ready)
        dispatch<IPreviewPlayingMessage>("PREVIEW_PLAYING", {playing: $playing}, iframe_element);
</script>

<iframe bind:this={iframe_element} class="sim--editor-render" src="/preview.html?file={file}" />

<style>
    :global(.sim--editor-render) {
        grid-area: render;

        border: none;

        height: 100%;
        width: 100%;
    }
</style>
