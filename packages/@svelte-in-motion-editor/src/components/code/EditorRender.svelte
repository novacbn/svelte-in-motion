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

    const {configuration, file, frame, framerate, maxframes, playing} = CONTEXT_EDITOR.get()!;

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

<div
    class="sim--editor-render"
    style="--width:{$configuration.width};--height:{$configuration.height};"
>
    <iframe bind:this={iframe_element} src="/preview.html?file={file}" />
</div>

<style>
    :global(.sim--editor-render) {
        display: flex;

        align-items: center;
        justify-content: center;

        grid-area: render;

        padding: 2rem;

        overflow: hidden;
    }

    :global(.sim--editor-render > iframe) {
        border: none;

        aspect-ratio: calc(var(--width) / var(--height));

        width: 100%;
        max-width: calc(var(--width) * 1px);
        max-height: 100%;

        /** SOURCE: https://www.magicpattern.design/tools/css-backgrounds */

        background-color: #ccc;
        background-image: repeating-linear-gradient(
                45deg,
                #ffffff 25%,
                transparent 25%,
                transparent 75%,
                #ffffff 75%,
                #ffffff
            ),
            repeating-linear-gradient(45deg, #ffffff 25%, #ccc 25%, #ccc 75%, #ffffff 75%, #ffffff);
        background-position: 0 0, 9px 9px;
        background-size: 18px 18px;
    }
</style>
