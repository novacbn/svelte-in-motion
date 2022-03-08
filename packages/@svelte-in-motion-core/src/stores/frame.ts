import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

import {make_scoped_context} from "../util/contexts";

export type IFrameStore = Writable<number>;

export const CONTEXT_FRAME = make_scoped_context<IFrameStore>("frame");

export function frame(value: number = 0): IFrameStore {
    return writable(value);
}
