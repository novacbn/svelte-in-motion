import {STORAGE_APP, STORAGE_FILESYSTEM} from "./definitions";
import SAMPLE from "./SAMPLE.svelte?raw";

const FILE_FIRST_RUN = ".first-run";

export function is_storage_prepared(): Promise<boolean> {
    return STORAGE_APP.hasItem(FILE_FIRST_RUN);
}

export async function prepare_storage(): Promise<void> {
    await STORAGE_FILESYSTEM.setItem("sample.svelte", SAMPLE);
    await STORAGE_APP.setItem(FILE_FIRST_RUN, "true");
}
