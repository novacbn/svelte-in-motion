import {build, initialize} from "esbuild-wasm";

import type {IDriver} from "@svelte-in-motion/storage";

import {javascript_plugin} from "./plugins/javascript";
import {storage_plugin} from "./plugins/storage";
import {svelte_plugin} from "./plugins/svelte";

export interface IBundleOptions {
    file: string;

    storage: IDriver;
}

export async function bundle(options: IBundleOptions): Promise<string> {
    const {file, storage} = options;

    await initialize({
        wasmURL: "/extern/wasm/esbuild.wasm",
        worker: false,
    });

    const result = await build({
        entryPoints: [file],

        format: "cjs",
        platform: "browser",

        bundle: true,
        write: false,

        external: [
            "@svelte-in-motion/animations",
            "@svelte-in-motion/core",
            "svelte",
            "svelte/animate",
            "svelte/easing",
            "svelte/internal",
            "svelte/motion",
            "svelte/store",
            "svelte/transition",
        ],

        plugins: [
            storage_plugin({
                storage,
            }),

            javascript_plugin({
                storage,
            }),

            svelte_plugin({
                storage,
            }),
        ],
    });

    const [output] = result.outputFiles;
    return output.text;
}
