import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

import {make_scoped_context} from "@svelte-in-motion/utilities";

export type IMaxFramesStore = Writable<number>;

export const CONTEXT_MAXFRAMES = make_scoped_context<IMaxFramesStore>("maxframes");

export function maxframes(value: number = 0): IMaxFramesStore {
    return writable(value);
}
