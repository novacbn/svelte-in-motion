import {indexeddb} from "@svelte-in-motion/storage";

export const FILE_CONFIGURATION_PREFERENCES = "preferences.json";

export const FILE_CONFIGURATION_WORKSPACE = ".svelte-in-motion.json";

export const FILE_CONFIGURATION_WORKSPACES = "workspaces.json";

export const STORAGE_USER = indexeddb("svelte-in-motion");
