import {resolve} from "path";

import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                job: resolve(__dirname, "job.html"),
                render: resolve(__dirname, "render.html"),
            },
        },
    },

    plugins: [svelte()],
});
