import type {Plugin} from "esbuild-wasm";
import {compile} from "svelte/compiler";

import type {IDriver} from "@svelte-in-motion/storage";
import {base_pathname} from "@svelte-in-motion/utilities";

export interface ISvelteOptions {
    storage: IDriver;
}

export function svelte_plugin(options: ISvelteOptions): Plugin {
    const {storage} = options;

    return {
        name: "sim-svelte",

        setup(build) {
            build.onLoad({filter: /\.svelte$/}, async (args) => {
                const file = base_pathname(args.path);
                const name = (file.split(".")[0] ?? "/App").slice(1);

                const script = await storage.read_file_text(args.path);

                const result = compile(script, {
                    name,
                    filename: file,

                    dev: true,
                    generate: "dom",
                    format: "esm",
                    css: true,
                });

                return {
                    contents: result.js.code,
                    loader: "js",
                };
            });
        },
    };
}
