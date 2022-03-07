<script lang="ts">
    import {onDestroy} from "svelte";

    import {debounce as _debounce} from "@svelte-in-motion/animations";

    import {dispatch, subscribe} from "../../lib/messages";
    import type {
        IRenderFrameMessage,
        IRenderFramerateMessage,
        IRenderMaxFramesMessage,
        IRenderPlayingMessage,
        IRenderReadyMessage,
        IRenderScriptMessage,
    } from "../../lib/types/render";

    let iframe_element: HTMLIFrameElement | undefined;

    export let frame: number = 0;
    export let framerate: number = 0;
    export let maxframes: number = 0;

    export let playing: boolean = false;

    export let debounce: number = 250;
    export let script: string;

    let _destroy_frame: (() => void) | null = null;
    let _destroy_ready: (() => void) | null = null;
    let _ready: boolean = false;

    function update_script(value: string): void {
        dispatch<IRenderScriptMessage>("RENDER_SCRIPT", {script: value}, iframe_element);
    }

    onDestroy(() => {
        if (_destroy_frame) _destroy_frame();
        if (_destroy_ready) _destroy_ready();
    });

    $: {
        if (iframe_element) {
            if (_destroy_ready) {
                _destroy_ready();
                _destroy_ready = null;
            }

            _destroy_ready = subscribe<IRenderReadyMessage>(
                "RENDER_READY",
                () => (_ready = true),
                iframe_element
            );
        }
    }

    $: {
        if (iframe_element) {
            if (_destroy_frame) {
                _destroy_frame();
                _destroy_frame = null;
            }

            _destroy_frame = subscribe<IRenderFrameMessage>(
                "RENDER_FRAME",
                (detail) => (frame = detail.frame),
                iframe_element
            );
        }
    }

    $: _update_script = _debounce(update_script, debounce);
    $: if (iframe_element && _ready) _update_script(script);

    $: if (iframe_element && _ready)
        dispatch<IRenderFrameMessage>("RENDER_FRAME", {frame}, iframe_element);
    $: if (iframe_element && _ready)
        dispatch<IRenderFramerateMessage>("RENDER_FRAMERATE", {framerate}, iframe_element);
    $: if (iframe_element && _ready)
        dispatch<IRenderMaxFramesMessage>("RENDER_MAXFRAMES", {maxframes}, iframe_element);

    $: if (iframe_element && _ready)
        dispatch<IRenderPlayingMessage>("RENDER_PLAYING", {playing}, iframe_element);
</script>

<iframe bind:this={iframe_element} class="sim--preview-render" src="/render.html" />

<style>
    :global(.sim--preview-render) {
        grid-area: render;

        border: none;

        height: 100%;
        width: 100%;
    }
</style>
