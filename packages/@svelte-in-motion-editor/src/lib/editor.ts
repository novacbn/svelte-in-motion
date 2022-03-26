import type {Readable, Writable} from "svelte/store";
import {derived, get, writable} from "svelte/store";

import type {
    IFrameRateStore,
    IFrameStore,
    IMaxFramesStore,
    IPlayingStore,
    ReadableOnly,
} from "@svelte-in-motion/core";
import {
    frame as frame_store,
    make_scoped_context,
    playing as playing_store,
} from "@svelte-in-motion/core";

import type {IContentStore} from "./stores/content";
import {content as make_content_store} from "./stores/content";
import type {IPathStore} from "./stores/path";
import {path as make_path_store} from "./stores/path";
import {prompts} from "./stores/prompts";
import {configuration as make_configuration_store} from "./stores/configuration";
import type {IErrorsStore} from "./stores/errors";
import {errors as make_errors_store} from "./stores/errors";

export const CONTEXT_EDITOR = make_scoped_context<IEditorContext>("editor");

export interface IEditorContext {
    content: IContentStore;

    errors: IErrorsStore;

    frame: IFrameStore;

    framerate: ReadableOnly<IFrameRateStore>;

    maxframes: ReadableOnly<IMaxFramesStore>;

    height: Readable<number>;

    path: IPathStore;

    playing: IPlayingStore;

    show_checkerboard: Writable<boolean>;

    show_script: Writable<boolean>;

    width: Readable<number>;

    zen_mode: Writable<boolean>;
}

function make_editor_context(path: IPathStore, content: IContentStore): IEditorContext {
    const configuration = make_configuration_store(content);

    const errors = make_errors_store();

    const frame = frame_store(0);
    const playing = playing_store(false);

    const framerate = derived(configuration, ($configuration) => $configuration?.framerate ?? 0);
    const maxframes = derived(configuration, ($configuration) => $configuration?.maxframes ?? 0);

    const height = derived(configuration, ($configuration) => $configuration?.height ?? 0);
    const width = derived(configuration, ($configuration) => $configuration?.width ?? 0);

    const show_checkerboard = writable<boolean>(true);
    const show_script = writable<boolean>(false);

    const zen_mode = writable<boolean>(false);

    return {
        content,
        errors,
        frame,
        framerate,
        height,
        maxframes,
        path,
        playing,
        show_checkerboard,
        show_script,
        width,
        zen_mode,
    };
}

export function editor(path: string): IEditorContext {
    const path_store = make_path_store(path);
    const content_store = make_content_store(path_store);

    return make_editor_context(path_store, content_store);
}

export function has_focus(): boolean {
    return !document.activeElement?.hasAttribute("contenteditable") && !get(prompts);
}
