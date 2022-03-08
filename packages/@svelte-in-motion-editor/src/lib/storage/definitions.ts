import {createStorage, prefixStorage} from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";
import memoryStorageDriver from "unstorage/drivers/memory";

export const STORAGE_FILESYSTEM = createStorage({
    driver: localStorageDriver({base: "filesystem"}),
});

export const STORAGE_CONFIG = prefixStorage(STORAGE_FILESYSTEM, "config");

export const STORAGE_USER = prefixStorage(STORAGE_FILESYSTEM, "user");

export const STORAGE_FRAMES = createStorage({
    driver: memoryStorageDriver(),
});
