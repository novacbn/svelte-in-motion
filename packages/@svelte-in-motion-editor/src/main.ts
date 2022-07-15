import "@kahi-ui/framework/dist/kahi-ui.framework.min.css";
import "@kahi-ui/framework/dist/kahi-ui.theme.default.min.css";

import type {SvelteComponent} from "svelte";

import {
    EXTENSION_ABOUT,
    EXTENSION_COMMANDS,
    EXTENSION_EDITOR,
    EXTENSION_EXPORT,
    EXTENSION_GRAMMARS,
    EXTENSION_PREVIEW,
    EXTENSION_TEMPLATES,
    EXTENSION_WORKSPACE,
} from "@svelte-in-motion/builtin-extensions";

import {app as make_app_context} from "./lib/app";
import Main from "./lib/Main.svelte";

(async () => {
    const app = await make_app_context();

    app.extensions.push(EXTENSION_ABOUT);
    app.extensions.push(EXTENSION_COMMANDS);
    app.extensions.push(EXTENSION_EXPORT);
    app.extensions.push(EXTENSION_EDITOR);
    app.extensions.push(EXTENSION_GRAMMARS);
    app.extensions.push(EXTENSION_PREVIEW);
    app.extensions.push(EXTENSION_WORKSPACE);
    app.extensions.push(EXTENSION_TEMPLATES);

    // @ts-expect-error - HACK: For debugging purposes only
    window.APP_CONTEXT = app;

    // @ts-expect-error - HACK: For debugging purposes only
    window.MAIN = new Main({
        target: document.body,
        props: {
            app,
        },
    });

    // HACK: DeepKit RPC tries to reference `global` for platform features, however it doesn't exist normally
    // https://github.com/deepkit/deepkit-framework/issues/26#issuecomment-605295794
    window.global = window;
})();
