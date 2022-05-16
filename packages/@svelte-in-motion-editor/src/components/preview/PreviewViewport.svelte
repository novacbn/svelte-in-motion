<script lang="ts">
    import type {IKeybindEvent} from "@kahi-ui/framework";
    import {Badge, Divider, Position} from "@kahi-ui/framework";
    import {onMount} from "svelte";
    import type {Readable} from "svelte/store";

    import {advance} from "@svelte-in-motion/core";
    import {debounce} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";
    import {has_focus} from "../../lib/editor";
    import {action_toggle_checkerboard, action_toggle_viewport} from "../../lib/keybinds";
    import {dispatch, subscribe} from "../../lib/messages";
    import {CONTEXT_PREVIEW} from "../../lib/preview";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    import type {
        IPreviewDestroyMessage,
        IPreviewErrorMessage,
        IPreviewFrameMessage,
        IPreviewMountMessage,
        IPreviewPlayingMessage,
        IPreviewReadyMessage,
    } from "../../lib/types/preview";

    import Loader from "../Loader.svelte";

    const {preferences} = CONTEXT_APP.get()!;
    const {file_path, frame, playing} = CONTEXT_PREVIEW.get()!;
    const {configuration, errors} = CONTEXT_WORKSPACE.get()!;

    // HACK: The JSON Schema validation makes sure these properties are /ALWAYS/ a number
    const framerate = configuration.watch<number>("framerate") as Readable<number>;
    const maxframes = configuration.watch<number>("maxframes") as Readable<number>;

    const _advance = advance({frame, framerate, maxframes, playing});

    let container_element: HTMLDivElement | undefined;
    let iframe_element: HTMLIFrameElement | undefined;
    let viewport_element: HTMLDivElement | undefined;

    let _viewport_height: number;
    let _viewport_width: number;

    let _preview_height: number;
    let _preview_width: number;

    let _mounted: boolean = false;
    let _ready: boolean = false;

    let _show_resolution: boolean = true;

    const hide_resolution = debounce(() => (_show_resolution = false), 2500);

    function on_checkerboard_toggle(event: IKeybindEvent): void {
        if (!has_focus()) return;

        event.preventDefault();
        if (!event.detail.active) return;

        preferences.set(
            "ui.preview.checkerboard.enabled",
            !preferences.get("ui.preview.checkerboard.enabled")
        );
    }

    function on_resolution_enter(event: PointerEvent): void {
        _show_resolution = true;
    }

    function on_resolution_exit(event: PointerEvent): void {
        _show_resolution = false;
    }

    function on_viewport_toggle(event: IKeybindEvent): void {
        if (!has_focus()) return;

        event.preventDefault();
        if (!event.detail.active) return;

        preferences.set(
            "ui.preview.viewport.enabled",
            !preferences.get("ui.preview.viewport.enabled")
        );
    }

    onMount(() => {
        if (!iframe_element) {
            throw ReferenceError("bad mount to 'PreviewViewport' (could not query iframe)");
        }

        const destroy_destroy = subscribe<IPreviewDestroyMessage>(
            "PREVIEW_DESTROY",
            () => (_mounted = false),
            iframe_element
        );

        const destroy_error = subscribe<IPreviewErrorMessage>(
            "PREVIEW_ERROR",
            ({message, name}) => {
                errors.push({
                    name,
                    message,
                    source: file_path,
                });
            },
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
            destroy_error();
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
        if (viewport_element) {
            const computed = getComputedStyle(viewport_element);

            const padding_top = parseInt(computed.paddingTop.slice(0, -2));
            const padding_bottom = parseInt(computed.paddingBottom.slice(0, -2));
            const padding_left = parseInt(computed.paddingLeft.slice(0, -2));
            const padding_right = parseInt(computed.paddingRight.slice(0, -2));

            const available_width = _viewport_width - (padding_left + padding_right);
            const available_height = _viewport_height - (padding_top + padding_bottom);

            const preferred_height =
                available_width * ($configuration.height / $configuration.width);
            const preferred_width =
                available_height * ($configuration.width / $configuration.height);

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

<svelte:window
    use:action_toggle_checkerboard={{on_bind: on_checkerboard_toggle}}
    use:action_toggle_viewport={{on_bind: on_viewport_toggle}}
/>

<div
    bind:this={viewport_element}
    class="box sim--preview-viewport"
    data-padding="large"
    style="display:{$preferences.ui.preview.viewport.enabled ? 'block' : 'none'}"
    bind:clientWidth={_viewport_width}
    bind:clientHeight={_viewport_height}
>
    <div
        bind:this={container_element}
        class="sim--preview-viewport--container"
        style="--configuration-width:{$configuration.width};--configuration-height:{$configuration.height};width:{_container_width}px;height:{_container_height}px"
    >
        <iframe
            class="sim--preview-viewport--preview"
            bind:this={iframe_element}
            src="/preview.html?file={file_path}"
            data-checkerboard={$preferences.ui.preview.checkerboard.enabled}
        />

        <Position spacing="tiny" variation={["container", "action"]}>
            <Badge
                class="sim--preview-viewport--resolution"
                style="opacity:{_show_resolution ? 1 : 0.25};"
                on:pointerenter={on_resolution_enter}
                on:pointerleave={on_resolution_exit}
            >
                {_preview_width}x{_preview_height}
                ({$configuration.width}x{$configuration.height})
            </Badge>
        </Position>

        <Loader hidden={$errors.length < 1 && _mounted} />
    </div>

    <Divider class="sim--preview-viewport--divider" palette="inverse" margin="none" />
</div>

<style>
    :global(.sim--preview-viewport) {
        display: flex;
        position: relative;

        align-items: center;
        justify-content: center;

        grid-area: viewport;

        overflow: hidden;
    }

    :global(.sim--preview-viewport--container) {
        display: flex;
        position: relative;

        border: 2px solid hsla(var(--palette-foreground-bold), 0.2);
    }

    :global(.sim--preview-viewport--preview) {
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

    :global(.sim--preview-viewport--preview[data-checkerboard="true"]) {
        --color-background: hsl(var(--palette-background-lighter));
        --color-foreground: hsla(var(--palette-foreground-normal), 0.2);
    }

    :global(.sim--preview-viewport--resolution) {
        transition: opacity var(--animations-visual-duration) var(--animations-visual-function);
    }

    :global(.sim--preview-viewport--divider) {
        position: absolute;

        bottom: 0;
        left: 0;
    }
</style>
