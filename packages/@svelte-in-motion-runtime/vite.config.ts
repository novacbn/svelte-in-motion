import {resolve} from "path";

import preprocess from "svelte-preprocess";
import {defineConfig} from "vite";
import {viteSingleFile} from "vite-plugin-singlefile";
import {svelte} from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    esbuild: {
        minify: true,
    },

    build: {
        minify: "terser",
        rollupOptions: {
            input: {
                index: resolve(__dirname, "src", "index.html"),
            },
        },
    },

    plugins: [
        svelte({
            preprocess: preprocess(),
        }),
        viteSingleFile({removeViteModuleLoader: true}),
    ],
});
