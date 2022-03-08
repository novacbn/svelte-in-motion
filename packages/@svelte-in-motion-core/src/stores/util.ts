import {Writable} from "svelte/store";

export type ReadableOnly<T extends Writable<any>> = Pick<T, "subscribe">;
