import {Check, Clock, Film, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/utilities";
import {event} from "@svelte-in-motion/utilities";

import type {IEncodeQueueOptions} from "./encodes";
import {encodes} from "./encodes";
import type {IRenderQueueOptions} from "./renders";
import {renders} from "./renders";

import type {ICollectionItem} from "./collection";
import {collection} from "./collection";
import type {INotification} from "./notifications";
import {notifications} from "./notifications";

export enum JOB_STATES {
    ended = "ended",

    encoding = "encoding",

    rendering = "rendering",

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

    has(identifier: string): boolean;

    queue(options: IJobQueueOptions): string;

    remove(identifier: string): IJob;

    track(identifier: string, on_remove?: INotification["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function jobqueue(): IJobQueueStore {
    const {get, has, push, subscribe, remove, update} = collection<IJob>();

    const EVENT_END = event<IJobEndEvent>();
    const EVENT_START = event<IJobEvent>();

    const EVENT_ENCODING = event<IJobEncodingEvent>();
    const EVENT_RENDERING = event<IJobRenderingEvent>();

    async function start_job(identifier: string, options: IJobQueueOptions): Promise<void> {
        const {file, encode, render} = options;

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
    }

    return {
        EVENT_END,
        EVENT_START,

        EVENT_ENCODING,
        EVENT_RENDERING,

        subscribe,

        has,

        queue(options) {
            const identifier = push({
                state: JOB_STATES.uninitialized,
            });

            start_job(identifier, options);
            return identifier;
        },

        remove(identifier) {
            const job = get(identifier);

            if (job.state !== JOB_STATES.ended) {
                throw new ReferenceError(
                    `bad argument #0 'jobqueue.remove' (job '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return job;
        },

        track(identifier, on_remove = undefined) {
            if (!has(identifier)) {
                throw new Error(
                    `bad argument #0 to 'jobqueue.track' (job '${identifier}' is not valid)`
                );
            }

            const notification_identifier = notifications.push({
                header: "Tracking job...",
                text: identifier,
                on_remove,
            });

            function update(): void {
                const job = get(identifier);

                switch (job.state) {
                    case JOB_STATES.ended:
                        notifications.update(notification_identifier, {
                            icon: Check,
                            header: "Job Finished",
                            dismissible: true,
                        });

                        break;

                    case JOB_STATES.encoding:
                        notifications.update(notification_identifier, {
                            icon: Film,
                            header: "Encoding Video",
                        });

                        break;

                    case JOB_STATES.rendering:
                        notifications.update(notification_identifier, {
                            icon: Video,
                            header: "Rendering Frames",
                        });

                        break;

                    case JOB_STATES.uninitialized:
                        notifications.update(notification_identifier, {
                            icon: Clock,
                            header: "Starting Job",
                        });

                        break;
                }
            }

            function on_event({job}: IJobEvent): void {
                if (job.identifier !== identifier) return;

                update();
            }

            const destroy_encoding = EVENT_ENCODING.subscribe(on_event);
            const destroy_rendering = EVENT_RENDERING.subscribe(on_event);
            const destroy_start = EVENT_START.subscribe(on_event);

            const destroy_end = EVENT_END.subscribe(({job}) => {
                if (job.identifier !== identifier) return;

                destroy_encoding();
                destroy_end();
                destroy_rendering();
                destroy_start();

                update();
            });

            update();
            return notification_identifier;
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
