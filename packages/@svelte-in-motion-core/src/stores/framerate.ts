import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

import {make_scoped_context} from "@svelte-in-motion/utilities";

export type IFrameRateStore = Writable<number>;

export const CONTEXT_FRAMERATE = make_scoped_context<IFrameRateStore>("framerate");

export function framerate(value: number = 0): IFrameRateStore {
    return writable(value);
}
