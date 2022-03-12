import * as svelte from "svelte";
import * as svelte_animate from "svelte/animate";
import * as svelte_easing from "svelte/easing";
import * as svelte_internal from "svelte/internal";
import * as svelte_motion from "svelte/motion";
import * as svelte_store from "svelte/store";
import * as svelte_transition from "svelte/transition";
import type {IPipelineContext, IPipelineImports} from "@novacbn/svelte-pipeline";

import * as animations from "@svelte-in-motion/animations";
import * as core from "@svelte-in-motion/core";

export const REPL_CONTEXT: IPipelineContext = {
    ...svelte,
    ...svelte_animate,
    ...svelte_easing,
    ...svelte_motion,
    ...svelte_store,
    ...svelte_transition,

    ...animations,
    ...core,
};

export const REPL_IMPORTS: IPipelineImports = {
    svelte: svelte,
    "svelte/animate": svelte_animate,
    "svelte/easing": svelte_easing,
    "svelte/internal": svelte_internal,
    "svelte/motion": svelte_motion,
    "svelte/store": svelte_store,
    "svelte/transition": svelte_transition,

    "@svelte-in-motion/animations": animations,
    "@svelte-in-motion/core": core,
};
