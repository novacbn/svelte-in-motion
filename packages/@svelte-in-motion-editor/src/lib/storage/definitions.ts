import {indexeddb} from "@svelte-in-motion/storage";

export const STORAGE_FILESYSTEM = indexeddb("svelte-in-motion");

export const STORAGE_CONFIG = STORAGE_FILESYSTEM.create_view("/.svelte-in-motion");

export const STORAGE_USER = STORAGE_FILESYSTEM;
