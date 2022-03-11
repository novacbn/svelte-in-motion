import {STORAGE_CONFIG, STORAGE_USER} from "./definitions";

import SAMPLE from "./SAMPLE.svelte?raw";

const FILE_INITIAL_RUN = ".initial-run";

export function is_storage_prepared(): Promise<boolean> {
    return STORAGE_CONFIG.hasItem(FILE_INITIAL_RUN);
}

export async function prepare_storage(): Promise<void> {
    await STORAGE_USER.setItem("Sample.svelte", SAMPLE);

    await STORAGE_CONFIG.setItem(FILE_INITIAL_RUN, "true");
}
