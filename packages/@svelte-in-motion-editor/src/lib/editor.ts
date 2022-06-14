import type {IDriver, IFileTextStore} from "@svelte-in-motion/storage";
import {preload_text} from "@svelte-in-motion/storage";
import {make_scoped_context} from "@svelte-in-motion/utilities";

export const CONTEXT_EDITOR = make_scoped_context<IEditorContext>("editor");

export interface IEditorContext {
    file_path: string;

    text: IFileTextStore;
}

export async function editor(driver: IDriver, file_path: string): Promise<IEditorContext> {
    const text = await preload_text(driver, file_path);

    return {
        file_path,
        text,
    };
}

export function has_focus(): boolean {
    return !document.activeElement?.hasAttribute("contenteditable");
}
