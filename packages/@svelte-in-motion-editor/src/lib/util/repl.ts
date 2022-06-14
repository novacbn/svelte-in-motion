import type {IEvaluationContext, IEvaluationImports} from "@svelte-in-motion/utilities";

import * as svelte from "svelte";
import * as svelte_animate from "svelte/animate";
import * as svelte_easing from "svelte/easing";
import * as svelte_internal from "svelte/internal";
import * as svelte_motion from "svelte/motion";
import * as svelte_store from "svelte/store";
import * as svelte_transition from "svelte/transition";

import * as sim_animations from "@svelte-in-motion/animations";
import * as sim_core from "@svelte-in-motion/core";
import * as sim_utilities from "@svelte-in-motion/utilities";

export const REPL_CONTEXT: IEvaluationContext = {};

export const REPL_IMPORTS: IEvaluationImports = {
    svelte: svelte,
    "svelte/animate": svelte_animate,
    "svelte/easing": svelte_easing,
    "svelte/internal": svelte_internal,
    "svelte/motion": svelte_motion,
    "svelte/store": svelte_store,
    "svelte/transition": svelte_transition,

    "@svelte-in-motion/animations": sim_animations,
    "@svelte-in-motion/core": sim_core,
    "@svelte-in-motion/utilities": sim_utilities,
};
