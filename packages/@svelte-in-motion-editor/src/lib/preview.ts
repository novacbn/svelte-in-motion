import type {IFrameStore, IPlayingStore} from "@svelte-in-motion/core";
import {frame as make_frame_store, playing as make_playing_store} from "@svelte-in-motion/core";
import {make_scoped_context} from "@svelte-in-motion/utilities";

export const CONTEXT_PREVIEW = make_scoped_context<IPreviewContext>("preview");

export interface IPreviewContext {
    file_path: string;

    frame: IFrameStore;

    playing: IPlayingStore;
}

export async function preview(file_path: string): Promise<IPreviewContext> {
    const frame = make_frame_store(0);
    const playing = make_playing_store(false);

    return {
        file_path,
        frame,
        playing,
    };
}
