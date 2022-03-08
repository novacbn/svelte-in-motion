import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

import {make_scoped_context} from "../util/contexts";

export type IMaxFramesStore = Writable<number>;

export const CONTEXT_MAXFRAMES = make_scoped_context<IMaxFramesStore>("maxframes");

export function maxframes(value: number = 3600): IMaxFramesStore {
    return writable(value);
}
