import type {IEncodeQueueOptions} from "./encodes";
import {encodes} from "./encodes";
import type {IRenderQueueOptions} from "./renders";
import {renders} from "./renders";

import type {Readable} from "svelte/store";
import {get, writable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event, generate_id} from "@svelte-in-motion/core";

export enum JOB_STATES {
    ended = "ended",

    encoding = "encoding",

    rendering = "rendering",

    started = "started",

    uninitialized = "uninitialized",
}

export interface IJobEvent {
    job: IJob;
}

export interface IJobEndEvent extends IJobEvent {
    video: Uint8Array;
}

export interface IJobEncodingEvent extends IJobEvent {
    job: IJobEncoding;

    encode: string;
}

export interface IJobRenderingEvent extends IJobEvent {
    job: IJobRendering;

    render: string;
}

export interface IJobBase {
    identifier: string;

    state: `${JOB_STATES}`;

    encode?: string;

    render?: string;
}

export interface IJobEncoding extends IJobBase {
    state: `${JOB_STATES.encoding}`;

    encode: string;
}

export interface IJobRendering extends IJobBase {
    state: `${JOB_STATES.rendering}`;

    render: string;
}

export type IJob = IJobBase | IJobEncoding | IJobRendering;

export type IJobQueueOptions = {
    file: string;

    encode: Omit<IEncodeQueueOptions, "frames">;

    render: Omit<IRenderQueueOptions, "file">;
};

export interface IJobQueueStore extends Readable<IJob[]> {
    EVENT_ENCODING: IEvent<IJobEncodingEvent>;

    EVENT_END: IEvent<IJobEndEvent>;

    EVENT_RENDERING: IEvent<IJobRenderingEvent>;

    EVENT_START: IEvent<IJobEvent>;

    queue(options: IJobQueueOptions): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function jobqueue(): IJobQueueStore {
    const store = writable<IJob[]>([]);

    const EVENT_END = event<IJobEndEvent>();
    const EVENT_START = event<IJobEvent>();

    const EVENT_ENCODING = event<IJobEncodingEvent>();
    const EVENT_RENDERING = event<IJobRenderingEvent>();

    function add_job(encode: IJob): IJob {
        const renders = get(store);

        store.set([...renders, encode]);
        return encode;
    }

    function get_job(identifier: string): IJob {
        const jobs = get(store);
        const index = jobs.findIndex((job) => job.identifier === identifier);

        if (index < 0) {
            throw new ReferenceError(
                `bad argument #0 to 'get_job' (invalid identifer '${identifier}')`
            );
        }

        return jobs[index];
    }

    async function start_job(identifier: string, options: IJobQueueOptions): Promise<void> {
        const {file, encode, render} = options;

        const render_job = renders.queue({
            ...render,
            file,
        });

        let job = update_job(identifier, {
            state: JOB_STATES.rendering,
            render: render_job,
        });

        EVENT_RENDERING.dispatch({
            job: job as IJobRendering,
            render: render_job,
        });

        const frames = await renders.yield(render_job);

        const encode_job = encodes.queue({...encode, frames});

        job = update_job(identifier, {
            state: JOB_STATES.encoding,
            encode: encode_job,
            render: undefined,
        });

        EVENT_ENCODING.dispatch({
            job: job as IJobEncoding,
            encode: encode_job,
        });

        const video = await encodes.yield(encode_job);

        job = update_job(identifier, {
            state: JOB_STATES.ended,
            encode: undefined,
        });

        EVENT_END.dispatch({
            job,
            video,
        });
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

        EVENT_ENCODING,
        EVENT_RENDERING,

        subscribe: store.subscribe,

        queue(options) {
            const identifier = generate_id();

            add_job({
                identifier,
                state: JOB_STATES.uninitialized,
            });

            start_job(identifier, options);

            return identifier;
        },

        yield(identifier) {
            const job = get_job(identifier);

            if (job.state === JOB_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'jobqueue.yield' (job '${identifier}' already ended)`
                );
            }

            return new Promise<Uint8Array>((resolve) => {
                const destroy = EVENT_END.subscribe(({job, video}) => {
                    if (identifier === job.identifier) {
                        resolve(video);
                        destroy();
                    }
                });
            });
        },
    };
}

export const jobs = jobqueue();

export const {EVENT_ENCODING, EVENT_END, EVENT_RENDERING, EVENT_START} = jobs;
