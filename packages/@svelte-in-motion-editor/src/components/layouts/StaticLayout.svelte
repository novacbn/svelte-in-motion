<div class="static-layout">
    <slot />
</div>

<style>
    :global(html, body) {
        width: 100%;
        height: 100%;

        overflow: hidden;
    }

    :global(body) {
        margin: 0;
    }

    :global(.static-layout) {
        display: grid;

        grid-template-areas:
            "editor controls"
            "editor render";

        grid-template-columns: max(25vw, 70ch) 1fr;
        grid-template-rows: max-content 1fr;

        width: min(100vw, 100%);
        height: min(100vh, 100%);
    }
</style>
