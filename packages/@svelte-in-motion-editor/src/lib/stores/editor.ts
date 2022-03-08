import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {IFrameStore, IPlayingStore} from "@svelte-in-motion/core";
import {
    frame as frame_store,
    make_scoped_context,
    playing as playing_store,
} from "@svelte-in-motion/core";
import type {IConfiguration} from "@svelte-in-motion/metadata";
import {parse_configuration} from "@svelte-in-motion/metadata";

import {IFileStore, preload_file} from "./file";
import {file as file_store} from "./file";

export const CONTEXT_EDITOR = make_scoped_context<IEditorContext>("editor");

export interface IEditorContext {
    configuration: Readable<IConfiguration>;

    content: IFileStore;

    file: string;

    frame: IFrameStore;

    playing: IPlayingStore;
}

export function editor(path: string, content: IFileStore = file_store(path)): IEditorContext {
    const configuration = derived(content, ($file) => parse_configuration($file));

    const frame = frame_store(0);
    const playing = playing_store(false);

    return {
        configuration,
        content,
        file: path,
        frame,
        playing,
    };
}

export async function preload_editor(path: string): Promise<IEditorContext> {
    const content = await preload_file(path);

    return editor(path, content);
}
