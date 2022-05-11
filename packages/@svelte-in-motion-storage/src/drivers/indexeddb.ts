import type {UseStore} from "idb-keyval";
import {createStore, del, keys, get, set} from "idb-keyval";

import type {IEvent} from "@svelte-in-motion/utilities";
import {
    append_pathname,
    dir_pathname,
    channel,
    normalize_pathname,
} from "@svelte-in-motion/utilities";

import {compress, decompress} from "../util/compression";
import {decode_text, encode_text} from "../util/encoding";
import {get_mimetype} from "../util/mimetypes";

import type {IDriver, IWatchEvent} from "./driver";
import {WATCH_EVENT_TYPES} from "./driver";
import {URLPattern} from "urlpattern-polyfill";

function create_store(identifier: string): UseStore {
    return createStore(identifier, identifier);
}

export function indexeddb(
    identifier: string,
    base: string = "/",
    directory_store: UseStore = create_store(`sim:storage:directories:${identifier}`),
    file_store: UseStore = create_store(`sim:storage:files:${identifier}`),
    watch_channel: IEvent<IWatchEvent> = channel(`sim:storage:indexeddb:${identifier}`)
): IDriver {
    base = normalize_pathname(base);

    return {
        async create_directory(path) {
            path = append_pathname(base, path);

            const dir_path = dir_pathname(path);

            const file_value = await get(dir_path, file_store);
            if (file_value) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.create_directory' (parent path '${dir_path}' is a file)`
                );
            }

            if (dir_path !== "/") {
                const directory_value = await get(dir_path, directory_store);
                if (!directory_value) {
                    throw new Error(
                        `bad argument #0 to 'indexeddb.create_directory' (parent path '${dir_path}' does not exist)`
                    );
                }
            }

            const path_value = await get(dir_path, file_store);
            if (path_value) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.create_directory' (path '${path}' already exists)`
                );
            }

            set(path, true, directory_store);

            watch_channel.dispatch({
                path,
                type: WATCH_EVENT_TYPES.create,
                stats: {
                    is_directory: true,
                    is_file: false,
                },
            } as IWatchEvent);
        },

        async create_file(path) {
            path = append_pathname(base, path);

            const dir_path = dir_pathname(path);

            const file_value = await get(dir_path, file_store);
            if (file_value) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.create_file' (parent path '${dir_path}' is a file)`
                );
            }

            if (dir_path !== "/") {
                const directory_value = await get(dir_path, directory_store);
                if (!directory_value) {
                    throw new Error(
                        `bad argument #0 to 'indexeddb.create_file' (parent path '${dir_path}' does not exist)`
                    );
                }
            }

            const path_value = await get(dir_path, file_store);
            if (path_value) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.create_file' (path '${path}' already exists)`
                );
            }

            set(path, "", file_store);

            watch_channel.dispatch({
                path,
                type: WATCH_EVENT_TYPES.create,
                stats: {
                    is_directory: false,
                    is_file: true,
                },
            } as IWatchEvent);
        },

        async create_hotlink(path, options = {}) {
            const {mimetype = get_mimetype(path)} = options;

            const buffer = await this.read_file(path);
            const blob = new Blob([buffer], {type: mimetype});

            const url = URL.createObjectURL(blob);

            return {
                path,
                url,

                async destroy() {
                    URL.revokeObjectURL(url);
                },
            };
        },

        create_view(path) {
            return indexeddb(identifier, path, directory_store, file_store, watch_channel);
        },

        async exists(path) {
            path = append_pathname(base, path);

            if (path === "/") {
                return true;
            }

            const [directory_value, file_value] = await Promise.all([
                get(path, directory_store),
                get(path, file_store),
            ]);

            return directory_value !== undefined || file_value !== undefined;
        },

        async read_directory(path, options = {}) {
            const {exclude_directories, exclude_files, pattern} = options;

            path = append_pathname(base, path);

            const file_value = await get(path, file_store);
            if (file_value !== undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.read_directory' (path '${path}' is a file)`
                );
            }

            if (path !== "/") {
                const directory_value = await get(path, directory_store);
                if (directory_value !== undefined) {
                    throw new Error(
                        `bad argument #0 to 'indexeddb.read_directory' (path '${path}' does not exist)`
                    );
                }
            }

            let node_keys: Awaited<ReturnType<typeof keys>>;
            if (exclude_directories) node_keys = await keys(file_store);
            else if (exclude_files) node_keys = await keys(directory_store);
            else {
                const [directory_keys, file_keys] = await Promise.all([
                    keys(directory_store),
                    keys(file_store),
                ]);

                node_keys = [...directory_keys, ...file_keys];
            }

            const matcher = pattern
                ? new URLPattern({pathname: append_pathname(path, pattern)})
                : null;

            const is_recursive = pattern ? pattern.includes("*") : false;

            return node_keys
                .filter((key, index) => {
                    key = key.toString();

                    return (
                        key.startsWith(path) &&
                        (is_recursive ? true : dir_pathname(key) === path) &&
                        (matcher ? matcher.test(key) : true)
                    );
                })
                .map((key) => key.toString().slice(path.length - 1));
        },

        async read_file(path) {
            path = append_pathname(base, path);

            const directory_value = await get(path, directory_store);
            if (directory_value !== undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.read_file' (path '${path}' is a directory)`
                );
            }

            const file_value = await get(path, file_store);
            if (file_value === undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.read_file' (path '${path}' does not exist)`
                );
            }

            return decompress(file_value);
        },

        async read_file_text(path) {
            const buffer = await this.read_file(path);
            return decode_text(buffer);
        },

        async remove_directory(path) {
            path = append_pathname(base, path);

            const file_value = await get(path, file_store);
            if (file_value !== undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.remove_directory' (path '${path}' is a file)`
                );
            }

            if (path === "/") {
                throw new Error(
                    `bad argument #0 to 'indexeddb.remove_directory' (cannot remove root directory)`
                );
            }

            const directory_value = await get(path, directory_store);
            if (directory_value === undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.remove_directory' (path '${path}' does not exist)`
                );
            }

            const [directory_keys, file_keys] = await Promise.all([
                keys(directory_store),
                keys(file_store),
            ]);

            await Promise.all([
                directory_keys
                    .filter((key, index) => key.toString().startsWith(path))
                    .map((key) => del(key, directory_store)),

                file_keys
                    .filter((key, index) => key.toString().startsWith(path))
                    .map((key) => del(key, file_store)),
            ]);
        },

        async remove_file(path) {
            path = append_pathname(base, path);

            const directory_value = await get(path, directory_store);
            if (directory_value !== undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.remove_file' (path '${path}' is a directory)`
                );
            }

            const file_value = await get(path, file_store);
            if (file_value === undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.remove_file' (path '${path}' does not exist)`
                );
            }

            return del(path, file_store);
        },

        async stats(path) {
            path = append_pathname(base, path);

            if (path === "/") {
                return {
                    is_directory: true,
                    is_file: false,
                };
            }

            const [directory_value, file_value] = await Promise.all([
                get(path, directory_store),
                get(path, file_store),
            ]);

            const is_directory = directory_value !== undefined;
            const is_file = file_value !== undefined;

            if (directory_value !== undefined && file_value !== undefined) return null;
            return {
                is_directory,
                is_file,
            };
        },

        async watch_directory(path, options) {
            const {exclude_directories, exclude_files, on_watch, pattern} = options;

            path = append_pathname(base, path);

            const file_value = await get(path, file_store);
            if (file_value !== undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.watch_directory' (path '${path}' is a file)`
                );
            }

            if (path !== "/") {
                const directory_value = await get(path, directory_store);
                if (directory_value === undefined) {
                    throw new Error(
                        `bad argument #0 to 'indexeddb.watch_directory' (path '${path}' does not exist)`
                    );
                }
            }

            const matcher = pattern
                ? new URLPattern({pathname: append_pathname(path, pattern)})
                : null;

            const is_recursive = pattern ? pattern.includes("*") : false;

            const destroy = watch_channel.subscribe((event) => {
                if (
                    (exclude_directories && event.stats.is_directory) ||
                    (exclude_files && event.stats.is_file) ||
                    !event.path.startsWith(path) ||
                    (!is_recursive && dir_pathname(event.path) !== path)
                ) {
                    return;
                }

                if (!matcher || matcher.test(event.path)) on_watch(event);
                if (event.path === path && event.type === WATCH_EVENT_TYPES.remove) destroy();
            });

            return destroy;
        },

        async watch_file(path, callback) {
            path = append_pathname(base, path);

            const directory_value = await get(path, directory_store);
            if (directory_value !== undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.watch_file' (path '${path}' is a directory)`
                );
            }

            const file_value = await get(path, file_store);
            if (file_value === undefined) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.watch_file' (path '${path}' does not exist)`
                );
            }

            const destroy = watch_channel.subscribe((event) => {
                if (event.path !== path) return;

                callback(event);
                if (event.type === WATCH_EVENT_TYPES.remove) destroy();
            });

            return destroy;
        },

        async write_file(path, buffer) {
            path = append_pathname(base, path);

            const dir_path = dir_pathname(path);

            const file_value = await get(dir_path, file_store);
            if (file_value) {
                throw new Error(
                    `bad argument #0 to 'indexeddb.write_file' (parent path '${dir_path}' is a file)`
                );
            }

            if (dir_path !== "/") {
                const directory_value = await get(dir_path, directory_store);
                if (!directory_value) {
                    throw new Error(
                        `bad argument #0 to 'indexeddb.write_file' (parent path '${dir_path}' does not exist)`
                    );
                }
            }

            const previously_existed = !!(await get(path, file_store));

            buffer = compress(buffer);
            set(path, buffer, file_store);

            watch_channel.dispatch({
                path,
                type: previously_existed ? WATCH_EVENT_TYPES.update : WATCH_EVENT_TYPES.create,
                stats: {
                    is_directory: false,
                    is_file: true,
                },
            } as IWatchEvent);
        },

        async write_file_text(path, text) {
            const buffer = encode_text(text);
            return this.write_file(path, buffer);
        },
    };
}
