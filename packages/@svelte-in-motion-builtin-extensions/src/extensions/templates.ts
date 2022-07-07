import type {IAppContext} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";

import {TEMPLATE_SIMPLE} from "../templates/simple";

export const EXTENSION_TEMPLATES = define_extension({
    identifier: "dev.nbn.sim.templates",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {templates} = app;

        templates.push(TEMPLATE_SIMPLE);
    },
});