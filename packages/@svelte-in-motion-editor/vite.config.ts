import {resolve} from "path";

import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";

// import {DeepkitTypePlugin} from "./vite/deepkit-type-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,

        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                preview: resolve(__dirname, "preview.html"),
            },
        },
    },

    server: {
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
        },
    },

    plugins: [
        svelte(),
        // DeepkitTypePlugin()
    ],
});
