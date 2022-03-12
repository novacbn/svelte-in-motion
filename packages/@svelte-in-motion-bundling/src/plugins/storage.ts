import type {Plugin} from "esbuild-wasm";

import {append_pathname} from "@svelte-in-motion/core";
import type {IDriver} from "@svelte-in-motion/storage";

export interface IStorageOptions {
    storage: IDriver;
}

export function storage_plugin(options: IStorageOptions): Plugin {
    const {storage} = options;

    return {
        name: "sim-storage",

        setup(build) {
            build.onResolve({filter: /.*/}, async (args) => {
                const path = append_pathname(args.resolveDir, args.path);
                const stats = await storage.stats(path);

                console.log("sim-storage", {args, stats});
                return stats && stats.is_file ? {path} : null;
            });
        },
    };
}
