import {Writable} from "svelte/store";
import {writable} from "svelte/store";

import {make_scoped_context} from "../util/contexts";

export type IPlayingStore = Writable<boolean>;

export const CONTEXT_PLAYING = make_scoped_context<IPlayingStore>("playing");

export function playing(value: boolean = false): IPlayingStore {
    return writable(value);
}
