import type {Readable} from "svelte/store";
import {writable} from "svelte/store";

import {subscribe} from "../messages";

export interface IJob {
    identifier: string;

    element: HTMLIFrameElement;

    end: number;

    start: number;
}

export interface IJobStore extends Readable<IJob[]> {
    queue(start: number, end: number): void;
}

export function jobs(): IJobStore {
    const jobs = writable([], (set) => {
        const destroy = subscribe;
    });

    return {
        subscribe: jobs.subscribe,

        queue(start, end) {},
    };
}
