<script lang="ts">
    import {Badge, Box, Divider, Position} from "@kahi-ui/framework";
    import {onMount} from "svelte";

    import {advance, debounce} from "@svelte-in-motion/core";

    import {dispatch, subscribe} from "../../lib/messages";
    import {CONTEXT_EDITOR} from "../../lib/stores/editor";
    import type {
        IPreviewFrameMessage,
        IPreviewPlayingMessage,
        IPreviewReadyMessage,
    } from "../../lib/types/preview";

    const {configuration, file, frame, framerate, maxframes, playing, show_checkerboard} =
        CONTEXT_EDITOR.get()!;

    const _advance = advance({frame, framerate, maxframes, playing});

    let iframe_element: HTMLIFrameElement | undefined;

    let _container_height: number;
    let _container_width: number;

    let _ready: boolean = false;
    let _show_resolution: boolean = true;

    const hide_resolution = debounce(() => (_show_resolution = false), 2500);

    function on_resolution_enter(event: PointerEvent): void {
        _show_resolution = true;
    }

    function on_resolution_exit(event: PointerEvent): void {
        hide_resolution();
    }

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
    $: $_advance;

    $: if (iframe_element && _ready)
        dispatch<IPreviewFrameMessage>("PREVIEW_FRAME", {frame: $frame}, iframe_element);

    $: if (iframe_element && _ready)
        dispatch<IPreviewPlayingMessage>("PREVIEW_PLAYING", {playing: $playing}, iframe_element);

    $: {
        // HACK: These are just here to make the block reactive
        _container_height;
        _container_width;

        _show_resolution = true;
        hide_resolution();
    }
</script>

<Box class="sim--editor-render" padding="large">
    <div
        class="sim--editor-render--container"
        style="--preview-width:{$configuration.width};--preview-height:{$configuration.height};"
        bind:clientWidth={_container_width}
        bind:clientHeight={_container_height}
    >
        <iframe
            class="sim--editor-render--preview"
            style="--container-width:{_container_width};--container-height:{_container_height};"
            bind:this={iframe_element}
            src="/preview.html?file={file}"
            data-checkerboard={$show_checkerboard}
        />

        <Position spacing="tiny" variation={["container", "action"]}>
            <Badge
                class="sim--editor-render--resolution"
                style="opacity:{_show_resolution ? 1 : 0.25};"
                on:pointerenter={on_resolution_enter}
                on:pointerleave={on_resolution_exit}
            >
                {_container_width}x{_container_height}
                ({$configuration.width}x{$configuration.height})
            </Badge>
        </Position>
    </div>

    <hr class="divider sim--editor-render--divider" data-palette="inverse" data-margin="none" />
</Box>

<style>
    :global(.sim--editor-render) {
        display: flex;
        position: relative;

        align-items: center;
        justify-content: center;

        grid-area: render;

        overflow: hidden;
    }

    :global(.sim--editor-render--container) {
        position: relative;

        border: 2px solid hsla(var(--palette-foreground-bold), 0.2);

        aspect-ratio: calc(var(--preview-width) / var(--preview-height));

        max-width: min(100%, calc(var(--preview-width) * 1px));
        max-height: min(100%, calc(var(--preview-height) * 1px));
        height: 100%;
    }

    :global(.sim--editor-render--preview) {
        --color-background: transparent;
        --color-foreground: transparent;

        width: calc(var(--container-width) * 1px);
        height: calc(var(--container-height) * 1px);

        border: none;

        /** SOURCE: https://www.magicpattern.design/tools/css-backgrounds */

        background-color: var(--color-foreground);
        background-image: repeating-linear-gradient(
                45deg,
                var(--color-background) 25%,
                transparent 25%,
                transparent 75%,
                var(--color-background) 75%,
                var(--color-background)
            ),
            repeating-linear-gradient(
                45deg,
                var(--color-background) 25%,
                var(--color-foreground) 25%,
                var(--color-foreground) 75%,
                var(--color-background) 75%,
                var(--color-background)
            );
        background-position: 0 0, 9px 9px;
        background-size: 18px 18px;

        transition: background var(--animations-visual-duration) var(--animations-visual-function);

        pointer-events: none;
        user-select: none;
    }

    :global(.sim--editor-render--preview[data-checkerboard="true"]) {
        --color-background: hsl(var(--palette-background-lighter));
        --color-foreground: hsla(var(--palette-foreground-normal), 0.2);
    }

    :global(.sim--editor-render--resolution) {
        transition: opacity var(--animations-visual-duration) var(--animations-visual-function);
    }

    :global(.sim--editor-render--divider) {
        position: absolute;

        bottom: 0;
        left: 0;
    }
</style>
