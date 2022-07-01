import "prismjs/themes/prism-tomorrow.css";

import "@kahi-ui/framework/dist/kahi-ui.framework.min.css";
import "@kahi-ui/framework/dist/kahi-ui.theme.default.min.css";

import type {SvelteComponent} from "svelte";

import {CONTEXT_APP, app as make_app_context} from "./lib/app";
import {app_router} from "./lib/router";

import {EXTENSION_APPLICATION} from "./lib/extensions/application.type";
import {EXTENSION_EDITOR} from "./lib/extensions/editor.type";
import {EXTENSION_EXPORT} from "./lib/extensions/export.type";
import {EXTENSION_PREVIEW} from "./lib/extensions/preview.type";

import * as Index from "./routes/index.svelte";

import * as WorkspaceIndex from "./routes/workspace/index.svelte";
import * as WorkspaceFile from "./routes/workspace/file.svelte";

(async () => {
    const app = await make_app_context();

    app.extensions.push(EXTENSION_APPLICATION);
    app.extensions.push(EXTENSION_EXPORT);
    app.extensions.push(EXTENSION_EDITOR);
    app.extensions.push(EXTENSION_PREVIEW);

    const [_, router] = app_router({
        context: {
            [CONTEXT_APP.key]: app,
        },

        routes: [Index, WorkspaceFile, WorkspaceIndex],
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
