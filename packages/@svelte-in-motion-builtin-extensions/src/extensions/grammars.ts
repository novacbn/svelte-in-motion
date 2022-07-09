import {html} from "@codemirror/lang-html";
import {javascript} from "@codemirror/lang-javascript";
import {markdown, markdownLanguage} from "@codemirror/lang-markdown";
import {xml} from "@codemirror/lang-xml";

import type {IAppContext} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";

export const EXTENSION_GRAMMARS = define_extension({
    identifier: "dev.nbn.sim.grammars",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {grammars} = app;

        grammars.push({
            identifier: "html",
            // TODO: Create custom Svelte parser
            extensions: [".html", ".svelte"],
            grammar: html(),
        });

        grammars.push({
            identifier: "javascript",
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            grammar: javascript({
                jsx: true,
                typescript: true,
            }),
        });

        grammars.push({
            identifier: "markdown",
            extensions: [".md"],
            grammar: markdown({
                base: markdownLanguage,
            }),
        });

        grammars.push({
            identifier: "xml",
            extensions: [".xml"],
            grammar: xml(),
        });
    },
});
