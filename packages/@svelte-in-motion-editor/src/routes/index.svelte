<script context="module" lang="ts">
    import type {ILoadCallback} from "../lib/router";

    export const pattern: string = "/";

    export const load: ILoadCallback = () => {
        return {
            redirect: "/editor/Sample.svelte",
        };
    };
</script>

hello world!
