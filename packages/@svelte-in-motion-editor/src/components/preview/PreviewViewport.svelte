<script lang="ts">
    import {Badge, Divider, Position} from "@kahi-ui/framework";
    import {derived} from "svelte/store";

    import {advance as make_advance_store} from "@svelte-in-motion/core";
    import type {IMessageEvent} from "@svelte-in-motion/utilities";
    import {debounce, message} from "@svelte-in-motion/utilities";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_PREVIEW} from "../../lib/preview";
    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    import {
        IPreviewDestroyMessage,
        IPreviewErrorMessage,
        IPreviewFrameMessage,
        IPreviewMountMessage,
        IPreviewPlayingMessage,
        IPreviewReadyMessage,
        MESSAGES_PREVIEW,
    } from "../../lib/types/preview";

    import Loader from "../Loader.svelte";

    const {preferences} = CONTEXT_APP.get()!;
    const {file_path, frame, playing} = CONTEXT_PREVIEW.get()!;
    const {configuration, errors, identifier} = CONTEXT_WORKSPACE.get()!;

    const framerate = derived(configuration, ($configuration) => $configuration.framerate);
    const maxframes = derived(configuration, ($configuration) => $configuration.maxframes);

    const advance = make_advance_store({frame, framerate, maxframes, playing});

    let container_element: HTMLDivElement | undefined;
    let iframe_element: HTMLIFrameElement | undefined;
    let viewport_element: HTMLDivElement | undefined;

    let messages:
        | IMessageEvent<
              | IPreviewDestroyMessage
              | IPreviewErrorMessage
              | IPreviewFrameMessage
              | IPreviewMountMessage
              | IPreviewPlayingMessage
              | IPreviewReadyMessage
          >
        | undefined;

    let _viewport_height: number;
    let _viewport_width: number;

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

    // HACK: Need to subscribe to it, so it'll run
    $: $advance;

    $: if (iframe_element) messages = message(iframe_element.contentWindow!);

    $: {
        if (messages && $messages) {
            const message = $messages;

            switch (message.name) {
                case MESSAGES_PREVIEW.destroy:
                    _mounted = false;
                    break;

                case MESSAGES_PREVIEW.error:
                    errors.push({
                        name: message.detail.name,
                        message: message.detail.message,
                        source: file_path,
                    });

                    break;

                case MESSAGES_PREVIEW.mount:
                    _mounted = true;
                    break;

                case MESSAGES_PREVIEW.ready:
                    _ready = true;
                    break;
            }
        }
    }

    $: if (messages && _ready)
        messages.dispatch({name: MESSAGES_PREVIEW.frame, detail: {frame: $frame}});

    $: if (messages && _ready)
        messages.dispatch({name: MESSAGES_PREVIEW.playing, detail: {playing: $playing}});

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
            src="/preview.html?workspace={identifier}&file={$file_path}"
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
