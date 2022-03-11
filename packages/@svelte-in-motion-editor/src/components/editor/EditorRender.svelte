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

    let _preview_height: number;
    let _preview_width: number;

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

        _preview_height = iframe_element?.clientHeight ?? 0;
        _preview_width = iframe_element?.clientWidth ?? 0;

        _show_resolution = true;
        hide_resolution();
    }
</script>

<Box class="sim--editor-render" padding="large">
    <div
        class="sim--editor-render--container"
        style="--configuration-width:{$configuration.width};--configuration-height:{$configuration.height};"
        bind:clientWidth={_container_width}
        bind:clientHeight={_container_height}
    >
        <iframe
            class="sim--editor-render--preview"
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
                {_preview_width}x{_preview_height}
                ({$configuration.width}x{$configuration.height})
            </Badge>
        </Position>
    </div>

    <Divider class="sim--editor-render--divider" palette="inverse" margin="none" />
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
        display: flex;
        position: relative;

        aspect-ratio: var(--configuration-width) / var(--configuration-height);

        border: 2px solid hsla(var(--palette-foreground-bold), 0.2);

        width: 100%;
        max-width: calc(var(--configuration-width) * 1px);
    }

    :global(.sim--editor-render--preview) {
        --color-background: transparent;
        --color-foreground: transparent;

        flex-grow: 1;

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
