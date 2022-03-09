import type {Readable} from "svelte/store";
import {get, writable} from "svelte/store";
import {prefixStorage} from "unstorage";

import {event, generate_id, IEvent} from "@svelte-in-motion/core";

import {subscribe} from "../messages";
import {STORAGE_FRAMES} from "../storage";
import type {IJobEndMessage, IJobFrameMessage, IJobStartMessage} from "../types/job";

export enum JOB_STATES {
    ended = "ended",

    paued = "paused",

    started = "started",

    uninitialized = "uninitialized",
}

export interface IJobDimensions {
    width: number;

    height: number;
}

export interface IJobEvent {
    job: IJob;
}

export interface IJobRange {
    end: number;

    start: number;
}

export interface IJob {
    identifier: string;

    element: HTMLIFrameElement;

    state: `${JOB_STATES}`;

    frame?: number;

    dimensions: IJobDimensions;

    range: IJobRange;
}

export type IJobQueueOptions = {
    file: string;
} & IJobDimensions &
    IJobRange;

export interface IJobStore extends Readable<IJob[]> {
    EVENT_END: IEvent<IJob>;

    EVENT_START: IEvent<IJob>;

    queue(options: IJobQueueOptions): string;
}

function _jobs(): IJobStore {
    const store = writable<IJob[]>([]);

    const EVENT_END = event<IJob>();
    const EVENT_START = event<IJob>();

    function add_job(job: IJob): void {
        const jobs = get(store);

        store.set([...jobs, job]);
    }

    function update_job(identifier: string, partial: Partial<IJob>): IJob {
        const jobs = get(store);
        const index = jobs.findIndex((job) => job.identifier === identifier);

        if (index < 0) {
            throw new ReferenceError(
                `bad argument #0 to 'update_job' (invalid identifer '${identifier}')`
            );
        }

        const job = (jobs[index] = {...jobs[index], ...partial});

        store.set(jobs);
        return job;
    }

    return {
        EVENT_END,
        EVENT_START,

        subscribe: store.subscribe,

        queue(options) {
            const {file, end, height, start, width} = options;
            const identifier = generate_id();

            const STORAGE_OUTPUT = prefixStorage(STORAGE_FRAMES, identifier);
            const iframe_element = document.createElement("IFRAME") as HTMLIFrameElement;

            // NOTE: Need to hide it so it basically acts like an "off-screen canvas"
            iframe_element.style.position = "fixed";
            iframe_element.style.pointerEvents = "none";
            iframe_element.style.opacity = "0";

            iframe_element.style.height = `${height}px`;
            iframe_element.style.width = `${width}px`;

            iframe_element.src = `/job.html?job=${identifier}&file=${file}&start=${start}&end=${end}`;

            add_job({
                identifier,
                element: iframe_element,
                state: JOB_STATES.uninitialized,
                dimensions: {width, height},
                range: {start, end},
            });

            iframe_element.addEventListener("load", () => {
                const destroy_frame = subscribe<IJobFrameMessage>(
                    "JOB_FRAME",
                    (detail) => update_job(identifier, {frame: detail.frame}),
                    iframe_element
                );

                const destroy_start = subscribe<IJobStartMessage>(
                    "JOB_START",
                    () => {
                        const job = update_job(identifier, {state: JOB_STATES.started});
                        EVENT_START.dispatch(job);
                    },

                    iframe_element
                );

                const destroy_end = subscribe<IJobEndMessage>(
                    "JOB_END",
                    async (detail) => {
                        await Promise.all(
                            detail.frames.map((frame, index) =>
                                STORAGE_OUTPUT.setItem(`${index + start}.png.datauri`, frame)
                            )
                        );

                        destroy_end();
                        destroy_frame();
                        destroy_start();

                        iframe_element.remove();

                        const job = update_job(identifier, {state: JOB_STATES.ended});
                        EVENT_END.dispatch(job);
                    },
                    iframe_element
                );
            });

            document.body.appendChild(iframe_element);
            return identifier;
        },
    };
}

export const jobs = _jobs();
