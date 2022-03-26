import {build, BuildResult, initialize, Message, OutputFile} from "esbuild-wasm";

import type {IDriver} from "@svelte-in-motion/storage";

import {javascript_plugin} from "./plugins/javascript";
import {storage_plugin} from "./plugins/storage";
import {svelte_plugin} from "./plugins/svelte";

let has_initialized: boolean = false;

interface IError {
    message: string;

    name: string;
}

export interface IBundleOptions {
    file: string;

    storage: IDriver;

    worker?: boolean;
}

export interface IBundleError {
    errors: IError[];
}

export interface IBundleSuccess {
    dependencies: string[];

    script: string;
}

function map_messages(messages: Message[]): IError[] {
    return messages.map((message, index) => {
        return {
            name: message.detail.name,
            message: message.text,
        };
    });
}

export async function bundle(options: IBundleOptions): Promise<IBundleError | IBundleSuccess> {
    const {file, storage, worker = false} = options;

    if (!has_initialized) {
        await initialize({
            wasmURL: "/extern/wasm/esbuild.wasm",
            worker,
        });

        has_initialized = true;
    }

    let result: BuildResult & {outputFiles: OutputFile[]};
    try {
        result = await build({
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
    } catch (err) {
        return {
            errors: map_messages((err as any).errors as Message[]),
        };
    }

    if (result.errors.length > 0) {
        return {
            errors: map_messages(result.errors),
        };
    }

    const [output] = result.outputFiles;
    const dependencies = Object.keys(result.metafile!.inputs);

    return {
        dependencies,
        script: output.text,
    };
}
