import {Check, Clock, Film, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event} from "@svelte-in-motion/core";

import type {IEncodeQueueOptions} from "./encodes";
import {encodes} from "./encodes";
import type {IRenderQueueOptions} from "./renders";
import {renders} from "./renders";

import type {ICollectionItem} from "./collection";
import {collection} from "./collection";
import {notifications} from "./notifications";

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

export interface IJobBase extends ICollectionItem {
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
    const {get, push, subscribe, remove, update} = collection<IJob>();

    const EVENT_END = event<IJobEndEvent>();
    const EVENT_START = event<IJobEvent>();

    const EVENT_ENCODING = event<IJobEncodingEvent>();
    const EVENT_RENDERING = event<IJobRenderingEvent>();

    async function start_job(identifier: string, options: IJobQueueOptions): Promise<void> {
        const {file, encode, render} = options;

        const notification_identifier = notifications.push({
            icon: Clock,
            header: "Starting Job",
            text: file,
        });

        const render_job = renders.queue({
            ...render,
            file,
        });

        let job = update(identifier, {
            state: JOB_STATES.rendering,
            render: render_job,
        });

        EVENT_RENDERING.dispatch({
            job: job as IJobRendering,
            render: render_job,
        });

        notifications.update(notification_identifier, {
            icon: Video,
            header: "Rendering",
        });

        const frames = await renders.yield(render_job);
        renders.remove(render_job);

        const encode_job = encodes.queue({...encode, frames});

        job = update(identifier, {
            state: JOB_STATES.encoding,
            encode: encode_job,
            render: undefined,
        });

        EVENT_ENCODING.dispatch({
            job: job as IJobEncoding,
            encode: encode_job,
        });

        notifications.update(notification_identifier, {
            icon: Film,
            header: "Encoding",
        });

        const video = await encodes.yield(encode_job);
        encodes.remove(encode_job);

        job = update(identifier, {
            state: JOB_STATES.ended,
            encode: undefined,
        });

        EVENT_END.dispatch({
            job,
            video,
        });

        notifications.update(notification_identifier, {
            icon: Check,
            dismissible: true,
            header: "Job Finished",

            on_remove: () => remove(identifier),
        });
    }

    return {
        EVENT_END,
        EVENT_START,

        EVENT_ENCODING,
        EVENT_RENDERING,

        subscribe,

        queue(options) {
            const identifier = push({
                state: JOB_STATES.uninitialized,
            });

            start_job(identifier, options);
            return identifier;
        },

        yield(identifier) {
            const job = get(identifier);

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
