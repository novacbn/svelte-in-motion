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

import {CONTEXT_APP, app as make_app_context} from "./lib/app";
import {app_router} from "./lib/router";

import * as Dashboard from "./routes/dashboard.svelte";
import * as Workspace from "./routes/workspace.svelte";

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

    const [_, router] = app_router({
        context: {
            [CONTEXT_APP.key]: app,
        },

        routes: [Dashboard, Workspace],
    });

    let component: SvelteComponent | null = null;

    window.addEventListener("keydown", (event) => app.keybinds.execute(event, true));
    window.addEventListener("keyup", (event) => app.keybinds.execute(event, false));

    router.subscribe((route) => {
        const splash_element = document.querySelector(".sim--splash");
        if (splash_element) splash_element.remove();

        if (component) {
            component.$destroy();
            component = null;
        }

        if (!route) return;
        const {Component, context = {}, props} = route;

        component = new Component({
            target: document.body,
            context: new Map<string, any>([...Object.entries(context), [CONTEXT_APP.key, app]]),

            props,
        });
    });

    // @ts-expect-error - HACK: For debugging purposes only
    window.APP_CONTEXT = app;

    // HACK: DeepKit RPC tries to reference `global` for platform features, however it doesn't exist normally
    // https://github.com/deepkit/deepkit-framework/issues/26#issuecomment-605295794
    window.global = window;
})();
