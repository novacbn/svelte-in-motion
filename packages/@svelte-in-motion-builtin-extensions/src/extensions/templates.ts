import type {IAppContext} from "@svelte-in-motion/extension";
import {define_extension} from "@svelte-in-motion/extension";

import {TEMPLATE_SAMPLE_INTERPOLATION, TEMPLATE_SAMPLE_TRANSITIONS} from "../templates/samples";
import {TEMPLATE_WELCOME} from "../templates/welcome";

export const EXTENSION_TEMPLATES = define_extension({
    identifier: "dev.nbn.sim.templates",
    is_builtin: true,

    on_activate(app: IAppContext) {
        const {templates} = app;

        templates.push(TEMPLATE_WELCOME);

        templates.push(TEMPLATE_SAMPLE_INTERPOLATION);
        templates.push(TEMPLATE_SAMPLE_TRANSITIONS);
    },
});
