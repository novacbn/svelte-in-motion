import {build, initialize} from "esbuild-wasm";

import type {IDriver} from "@svelte-in-motion/storage";

import {javascript_plugin} from "./plugins/javascript";
import {storage_plugin} from "./plugins/storage";
import {svelte_plugin} from "./plugins/svelte";

let has_initialized: boolean = false;

export interface IBundleOptions {
    file: string;

    storage: IDriver;

    worker?: boolean;
}

export async function bundle(options: IBundleOptions): Promise<[string, string[]]> {
    const {file, storage, worker = false} = options;

    if (!has_initialized) {
        await initialize({
            wasmURL: "/extern/wasm/esbuild.wasm",
            worker,
        });

        has_initialized = true;
    }

    const result = await build({
        entryPoints: [file],

        format: "cjs",
        platform: "browser",

        metafile: true,

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
    const dependencies = Object.keys(result.metafile!.inputs);

    return [output.text, dependencies];
}
