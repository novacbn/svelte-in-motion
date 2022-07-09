import type {EditorView} from "@codemirror/view";
import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export type IEditorViewStore = Writable<EditorView | null>;

export function editorview(view?: EditorView): IEditorViewStore {
    return writable(view ?? null);
}
