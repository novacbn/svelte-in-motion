import {resolve} from "path";

import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,

        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                render: resolve(__dirname, "render.html"),
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

    plugins: [svelte()],
});
