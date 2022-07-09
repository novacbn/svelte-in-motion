import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export type IFilePathStore = Writable<string>;

export function filepath(file_path: string): IFilePathStore {
    return writable(file_path);
}
