<script lang="ts">
    import {pipeline_svelte} from "@novacbn/svelte-pipeline";
    import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";
    import type {SvelteComponent} from "svelte";

    import {debounce} from "@svelte-in-motion/transitions";

    import {REPL_CONTEXT, REPL_IMPORTS} from "../../lib/repl";

    type $$Events = {
        destroy: CustomEvent<{component: SvelteComponent}>;

        error: CustomEvent<{error: Error}>;

        mount: CustomEvent<{component: SvelteComponent}>;
    };

    const pipeline_store = pipeline_svelte({
        context: REPL_CONTEXT,
        imports: REPL_IMPORTS,

        compiler: {
            dev: true,
            generate: "dom",
            name: "App",
            filename: "App.svelte",
        },
    });

    const update_store = debounce((code: string) => ($pipeline_store = code), 250);

    export let value: string;

    $: update_store(value);
</script>

<PipelineRenderComponent
    class="sim--code-render"
    pipeline={pipeline_store}
    on:destroy
    on:error
    on:error={(event) => console.error(event.detail.error)}
    on:mount
/>

<style>
    :global(.sim--code-render) {
        grid-area: render;
    }
</style>
