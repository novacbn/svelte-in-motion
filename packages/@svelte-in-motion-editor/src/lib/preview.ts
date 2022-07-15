import type {IFrameStore, IPlayingStore} from "@svelte-in-motion/core";
import {frame as make_frame_store, playing as make_playing_store} from "@svelte-in-motion/core";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import type {IFilePathStore} from "./stores/io";
import {filepath as make_filepath_store} from "./stores/io";

export const CONTEXT_PREVIEW = make_scoped_context<IPreviewContext, "preview">("preview");

export interface IPreviewContext {
    file_path: IFilePathStore;

    frame: IFrameStore;

    playing: IPlayingStore;
}

export async function preview(file_path: string): Promise<IPreviewContext> {
    return {
        file_path: make_filepath_store(file_path),
        frame: make_frame_store(0),
        playing: make_playing_store(false),
    };
}
