import {createStorage} from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";
import memoryStorageDriver from "unstorage/drivers/memory";

export const STORAGE_APP = createStorage({
    driver: localStorageDriver({base: "app"}),
});

export const STORAGE_FILESYSTEM = createStorage({
    driver: localStorageDriver({base: "filesystem"}),
});

export const STORAGE_FRAMES = createStorage({
    driver: memoryStorageDriver(),
});
