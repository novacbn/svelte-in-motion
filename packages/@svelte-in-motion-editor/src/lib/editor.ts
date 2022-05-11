import {get} from "svelte/store";

import type {IFrameStore, IPlayingStore} from "@svelte-in-motion/core";
import {frame as frame_store, playing as playing_store} from "@svelte-in-motion/core";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import {prompts} from "./stores/prompts";
import type {IErrorsStore} from "./stores/errors";
import {errors as make_errors_store} from "./stores/errors";
import {IDriver, IFileTextStore, preload_text} from "@svelte-in-motion/storage";

export const CONTEXT_EDITOR = make_scoped_context<IEditorContext>("editor");

export interface IEditorContext {
    errors: IErrorsStore;

    frame: IFrameStore;

    file_path: string;

    playing: IPlayingStore;

    text: IFileTextStore;
}

export async function editor(driver: IDriver, file_path: string): Promise<IEditorContext> {
    const text = await preload_text(driver, file_path);

    const errors = make_errors_store();

    const frame = frame_store(0);
    const playing = playing_store(false);

    return {
        errors,
        frame,
        file_path,
        playing,
        text,
    };
}

export function has_focus(): boolean {
    return !document.activeElement?.hasAttribute("contenteditable") && !get(prompts);
}
