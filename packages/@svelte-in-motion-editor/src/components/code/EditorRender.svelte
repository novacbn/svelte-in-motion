<script lang="ts">
    import {onMount} from "svelte";

    import {advance} from "@svelte-in-motion/core";

    import {dispatch, subscribe} from "../../lib/messages";
    import type {
        IRenderFrameMessage,
        IRenderPlayingMessage,
        IRenderReadyMessage,
    } from "../../lib/types/render";
    import {CONTEXT_EDITOR} from "../../lib/stores/editor";

    const {file, frame, framerate, maxframes, playing} = CONTEXT_EDITOR.get()!;

    const _advance = advance({frame, framerate, maxframes, playing});

    let iframe_element: HTMLIFrameElement | undefined;

    let _ready: boolean = false;

    onMount(() => {
        if (!iframe_element) {
            throw ReferenceError("bad mount to 'PreviewRender' (could not query iframe)");
        }

        const destroy = subscribe<IRenderReadyMessage>(
            "RENDER_READY",
            () => (_ready = true),
            iframe_element
        );

        return () => destroy();
    });

    // HACK: Need to subscribe to it, so it'll run
    $_advance;

    $: if (iframe_element && _ready)
        dispatch<IRenderFrameMessage>("RENDER_FRAME", {frame: $frame}, iframe_element);

    $: if (iframe_element && _ready)
        dispatch<IRenderPlayingMessage>("RENDER_PLAYING", {playing: $playing}, iframe_element);
</script>

<iframe bind:this={iframe_element} class="sim--editor-render" src="/render.html?file={file}" />

<style>
    :global(.sim--editor-render) {
        grid-area: render;

        border: none;

        height: 100%;
        width: 100%;
    }
</style>
