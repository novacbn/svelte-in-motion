import {STORAGE_CONFIG, STORAGE_USER} from "./definitions";

import SAMPLE from "./SAMPLE.svelte?raw";

const FILE_INITIAL_RUN = ".initial-run";

export function is_storage_prepared(): Promise<boolean> {
    return STORAGE_CONFIG.exists(FILE_INITIAL_RUN);
}

export async function prepare_storage(): Promise<void> {
    await STORAGE_USER.write_file_text("Sample.sim.svelte", SAMPLE);

    if (!(await STORAGE_CONFIG.exists("/"))) {
        await STORAGE_CONFIG.create_directory("/");
    }

    await STORAGE_CONFIG.create_file(FILE_INITIAL_RUN);
}
