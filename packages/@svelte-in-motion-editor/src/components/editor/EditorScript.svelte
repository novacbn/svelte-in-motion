<script context="module" lang="ts">
    import {EditorView} from "@codemirror/view";

    const THEME_SIM = EditorView.baseTheme({
        "&": {height: "100%"},
        ".cm-scroller": {overflow: "auto"},
    });
</script>

<script lang="ts">
    import {defaultKeymap, history, historyKeymap, indentWithTab} from "@codemirror/commands";
    import {
        defaultHighlightStyle,
        foldGutter,
        indentOnInput,
        syntaxHighlighting,
    } from "@codemirror/language";
    import {oneDark} from "@codemirror/theme-one-dark";
    import {highlightSelectionMatches} from "@codemirror/search";
    import {EditorState} from "@codemirror/state";
    import {
        drawSelection,
        highlightActiveLine,
        highlightActiveLineGutter,
        highlightSpecialChars,
        lineNumbers,
        keymap,
        rectangularSelection,
    } from "@codemirror/view";
    import {Divider} from "@kahi-ui/framework";
    import {onDestroy} from "svelte";

    import {CONTEXT_APP} from "../../lib/app";
    import {CONTEXT_EDITOR} from "../../lib/editor";

    import Loader from "../Loader.svelte";

    let editor_element: HTMLDivElement | undefined;

    const {grammars, preferences} = CONTEXT_APP.get()!;
    const {file_path, text, view} = CONTEXT_EDITOR.get()!;

    const grammar = grammars.find((item) =>
        item.extensions.some((extension) => $file_path.toLowerCase().endsWith(extension))
    );

    const on_update = EditorView.updateListener.of((update) => {
        if (update.docChanged) $text = update.state.doc.sliceString(0);
    });

    onDestroy(() => {
        $view?.destroy();
    });

    $: if (editor_element) {
        $view = new EditorView({
            doc: $text ?? "",
            parent: editor_element,

            extensions: [
                drawSelection(),
                EditorState.allowMultipleSelections.of(true),
                EditorState.tabSize.of(2),
                foldGutter(),
                highlightActiveLine(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                highlightSelectionMatches(),
                history(),
                indentOnInput(),
                lineNumbers(),
                rectangularSelection(),
                syntaxHighlighting(defaultHighlightStyle, {fallback: true}),

                keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),

                oneDark,
                THEME_SIM,

                ...(grammar ? [grammar.grammar] : []),

                on_update,
            ],
        });
    }
</script>

<div
    class="sim--editor-script"
    style="display:{$preferences.ui.editor.script.enabled ? 'block' : 'none'}"
>
    {#if $text !== null}
        <div bind:this={editor_element} class="sim--editor-script--view" />
    {/if}

    <Divider
        class="sim--editor-script--divider"
        orientation="vertical"
        palette="inverse"
        margin="none"
    />

    <Loader hidden={$text !== null} />
</div>

<style>
    :global(.sim--editor-script) {
        position: relative;

        grid-area: script;

        width: 65ch;
    }

    :global(.sim--editor-script--view) {
        height: 100%;

        overflow: hidden;
    }

    :global(.sim--editor-script--divider) {
        position: absolute;

        top: 0;
        right: 0;
    }
</style>
