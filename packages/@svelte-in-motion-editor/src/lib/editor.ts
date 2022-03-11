import type {Readable, Writable} from "svelte/store";
import {derived, get, writable} from "svelte/store";

import type {
    IFrameRateStore,
    IFrameStore,
    IMaxFramesStore,
    IPlayingStore,
} from "@svelte-in-motion/core";
import {
    frame as frame_store,
    make_scoped_context,
    playing as playing_store,
} from "@svelte-in-motion/core";
import type {IConfiguration} from "@svelte-in-motion/metadata";
import {parse_configuration} from "@svelte-in-motion/metadata";

import type {IFileStore} from "./stores/file";
import {file as file_store, preload_file} from "./stores/file";
import {prompts} from "./stores/prompts";

export const CONTEXT_EDITOR = make_scoped_context<IEditorContext>("editor");

export interface IEditorContext {
    configuration: Readable<IConfiguration>;

    content: IFileStore;

    file: string;

    frame: IFrameStore;

    framerate: Omit<IFrameRateStore, "set" | "update">;

    maxframes: Omit<IMaxFramesStore, "set" | "update">;

    playing: IPlayingStore;

    show_checkerboard: Writable<boolean>;

    show_script: Writable<boolean>;

    zen_mode: Writable<boolean>;
}

export function editor(path: string, content: IFileStore = file_store(path)): IEditorContext {
    const configuration = derived(content, ($file) => parse_configuration($file));

    const frame = frame_store(0);
    const playing = playing_store(false);

    const framerate = derived(configuration, ($configuration) => $configuration.framerate);
    const maxframes = derived(configuration, ($configuration) => $configuration.maxframes);

    const show_checkerboard = writable<boolean>(true);
    const show_script = writable<boolean>(false);

    const zen_mode = writable<boolean>(false);

    return {
        configuration,
        content,
        file: path,
        frame,
        framerate,
        maxframes,
        playing,
        show_checkerboard,
        show_script,
        zen_mode,
    };
}

export function has_focus(): boolean {
    return !document.activeElement?.hasAttribute("contenteditable") && !get(prompts);
}

export async function preload_editor(path: string): Promise<IEditorContext> {
    const content = await preload_file(path);

    return editor(path, content);
}
