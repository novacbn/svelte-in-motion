import type {IDriver, IFileTextStore} from "@svelte-in-motion/storage";
import {preload_text} from "@svelte-in-motion/storage";
import {make_scoped_context} from "@svelte-in-motion/utilities";

import type {IEditorViewStore} from "./stores/editor";
import {editorview as make_editorview_store} from "./stores/editor";
import type {IFilePathStore} from "./stores/io";
import {filepath as make_filepath_store} from "./stores/io";

export const CONTEXT_EDITOR = make_scoped_context<IEditorContext>("editor");

export interface IEditorContext {
    file_path: IFilePathStore;

    text: IFileTextStore;

    view: IEditorViewStore;
}

export async function editor(storage: IDriver, file_path: string): Promise<IEditorContext> {
    const text = await preload_text(storage, file_path);

    return {
        file_path: make_filepath_store(file_path),
        text,
        view: make_editorview_store(),
    };
}
