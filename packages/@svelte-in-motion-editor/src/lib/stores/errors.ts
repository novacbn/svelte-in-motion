import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export interface IError {
    message: string;

    name: string;
}

export type IErrorsStore = Writable<IError | null>;

export function errors(): IErrorsStore {
    return writable(null);
}
