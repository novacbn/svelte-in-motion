import type {Plugin} from "esbuild-wasm";

import type {IDriver} from "@svelte-in-motion/storage";

export interface IStorageOptions {
    storage: IDriver;
}

export function javascript_plugin(options: IStorageOptions): Plugin {
    const {storage} = options;

    return {
        name: "sim-javascript",

        setup(build) {
            build.onLoad({filter: /\.js$/}, async (args) => {
                console.log("sim-javascript", {args});
                const script = await storage.read_file_text(args.path);

                return {
                    contents: script,
                    loader: "js",
                };
            });
        },
    };
}
