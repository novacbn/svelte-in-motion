<script lang="ts">
    import {Badge, Divider, Position} from "@kahi-ui/framework";
    import {onMount} from "svelte";

    import {advance, debounce} from "@svelte-in-motion/core";

    import {dispatch, subscribe} from "../../lib/messages";
    import {CONTEXT_EDITOR} from "../../lib/editor";

    import type {
        IPreviewDestroyMessage,
        IPreviewFrameMessage,
        IPreviewMountMessage,
        IPreviewPlayingMessage,
        IPreviewReadyMessage,
    } from "../../lib/types/preview";

    import Loader from "../Loader.svelte";

    const {frame, framerate, height, maxframes, path, playing, show_checkerboard, width} =
        CONTEXT_EDITOR.get()!;

    const _advance = advance({frame, framerate, maxframes, playing});

    let container_element: HTMLDivElement | undefined;
    let render_element: HTMLDivElement | undefined;
    let iframe_element: HTMLIFrameElement | undefined;

    let _render_height: number;
    let _render_width: number;

    let _preview_height: number;
    let _preview_width: number;

    let _mounted: boolean = false;
    let _ready: boolean = false;

    let _show_resolution: boolean = true;

    const hide_resolution = debounce(() => (_show_resolution = false), 2500);

    function on_resolution_enter(event: PointerEvent): void {
        _show_resolution = true;
    }

    function on_resolution_exit(event: PointerEvent): void {
        _show_resolution = false;
    }

    onMount(() => {
        if (!iframe_element) {
            throw ReferenceError("bad mount to 'EditorRender' (could not query iframe)");
        }

        const destroy_destroy = subscribe<IPreviewDestroyMessage>(
            "PREVIEW_DESTROY",
            () => (_mounted = false),
            iframe_element
        );

        const destroy_mounted = subscribe<IPreviewMountMessage>(
            "PREVIEW_MOUNT",
            () => (_mounted = true),
            iframe_element
        );

        const destroy_ready = subscribe<IPreviewReadyMessage>(
            "PREVIEW_READY",
            () => (_ready = true),
            iframe_element
        );

        return () => {
            destroy_destroy();
            destroy_mounted();
            destroy_ready();
        };
    });

    // HACK: Need to subscribe to it, so it'll run
    $: $_advance;

    $: if (iframe_element && _ready)
        dispatch<IPreviewFrameMessage>("PREVIEW_FRAME", {frame: $frame}, iframe_element);

    $: if (iframe_element && _ready)
        dispatch<IPreviewPlayingMessage>("PREVIEW_PLAYING", {playing: $playing}, iframe_element);

    let _container_width: number;
    let _container_height: number;

    $: {
        if (render_element) {
            const computed = getComputedStyle(render_element);

            const padding_top = parseInt(computed.paddingTop.slice(0, -2));
            const padding_bottom = parseInt(computed.paddingBottom.slice(0, -2));
            const padding_left = parseInt(computed.paddingLeft.slice(0, -2));
            const padding_right = parseInt(computed.paddingRight.slice(0, -2));

            const available_width = _render_width - (padding_left + padding_right);
            const available_height = _render_height - (padding_top + padding_bottom);

            const preferred_height = available_width * ($height / $width);
            const preferred_width = available_height * ($width / $height);

            if (preferred_height > available_height) {
                _container_width = preferred_width;
                _container_height = available_height;
            } else {
                _container_width = available_width;
                _container_height = preferred_height;
            }
        }
    }

    $: {
        if (container_element && iframe_element) {
            const computed = getComputedStyle(container_element);
            const border_width = parseInt(computed.borderWidth.slice(0, -2)) * 2;

            _preview_height = Math.trunc(_container_height - border_width);
            _preview_width = Math.trunc(_container_width - border_width);

            _show_resolution = true;
            hide_resolution();
        }
    }
</script>

<div
    bind:this={render_element}
    class="box sim--editor-render"
    data-padding="large"
    bind:clientWidth={_render_width}
    bind:clientHeight={_render_height}
>
    <div
        bind:this={container_element}
        class="sim--editor-render--container"
        style="--configuration-width:{$width};--configuration-height:{$height};width:{_container_width}px;height:{_container_height}px"
    >
        <iframe
            class="sim--editor-render--preview"
            bind:this={iframe_element}
            src="/preview.html?file={$path}"
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
                ({$width}x{$height})
            </Badge>
        </Position>

        <Loader hidden={_mounted} />
    </div>

    <Divider class="sim--editor-render--divider" palette="inverse" margin="none" />
</div>

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

        border: 2px solid hsla(var(--palette-foreground-bold), 0.2);
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
