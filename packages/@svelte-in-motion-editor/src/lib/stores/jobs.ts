//import {Check, Clock, Film, Video} from "lucide-svelte";
import type {Readable} from "svelte/store";

import type {ICollectionItem, IEvent} from "@svelte-in-motion/utilities";
import {collection, event, generate_uuid} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

import type {IEncodeQueueOptions} from "./encodes";
import type {IRenderQueueOptions} from "./renders";
import type {INotificationItem} from "./notifications";

export enum JOB_STATES {
    ended = "ended",

    encoding = "encoding",

    rendering = "rendering",

    uninitialized = "uninitialized",
}

export interface IJobEvent {
    job: IJobItem;
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

    encode: string;

    render: string;
}

export type IJobItem = IJobBase | IJobEncoding | IJobRendering;

export type IJobQueueOptions = {
    workspace: string;

    file: string;

    encode: Omit<IEncodeQueueOptions, "frames">;

    render: Omit<IRenderQueueOptions, "file" | "workspace">;
};

export interface IJobsStore extends Readable<IJobItem[]> {
    EVENT_ENCODING: IEvent<IJobEncodingEvent>;

    EVENT_END: IEvent<IJobEndEvent>;

    EVENT_RENDERING: IEvent<IJobRenderingEvent>;

    EVENT_START: IEvent<IJobEvent>;

    has(identifier: string): boolean;

    queue(options: IJobQueueOptions): Promise<string>;

    remove(identifier: string): IJobItem;

    track(identifier: string, on_remove?: INotificationItem["on_remove"]): string;

    yield(identifier: string): Promise<Uint8Array>;
}

export function jobs(app: IAppContext): IJobsStore {
    const {encodes, notifications, renders} = app;

    const {find, has, push, subscribe, remove, update} = collection<IJobItem>();

    const EVENT_END = event<IJobEndEvent>();
    const EVENT_START = event<IJobEvent>();

    const EVENT_ENCODING = event<IJobEncodingEvent>();
    const EVENT_RENDERING = event<IJobRenderingEvent>();

    async function run_job(identifier: string, options: IJobQueueOptions): Promise<void> {
        const {file, encode, render, workspace} = options;

        const render_identifier = await renders.queue({
            ...render,
            file,
            workspace,
        });

        let job = update("identifier", identifier, {
            state: JOB_STATES.rendering,
            render: render_identifier,
        });

        EVENT_RENDERING.dispatch({
            job: job as IJobRendering,
            render: render_identifier,
        });

        const frames = await renders.yield(render_identifier);
        renders.remove(render_identifier);

        const encode_identifier = await encodes.queue({...encode, frames});

        job = update("identifier", identifier, {
            state: JOB_STATES.encoding,
            encode: encode_identifier,
            render: undefined,
        });

        EVENT_ENCODING.dispatch({
            job: job as IJobEncoding,
            encode: encode_identifier,
        });

        const video = await encodes.yield(encode_identifier);
        encodes.remove(encode_identifier);

        job = update("identifier", identifier, {
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

        async queue(options) {
            const {identifier} = push({
                identifier: generate_uuid(),
                state: JOB_STATES.uninitialized,
            });

            run_job(identifier, options);
            return identifier;
        },

        remove(identifier) {
            const job = find(identifier);

            if (!job) {
                throw new ReferenceError(
                    `bad argument #0 to 'jobs.remove' (job '${identifier}' is not valid)`
                );
            }

            if (job.state !== JOB_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'jobs.remove' (job '${identifier}' has not ended)`
                );
            }

            remove(identifier);
            return job;
        },

        track(identifier, on_remove = undefined) {
            const job = find("identifier", identifier);
            if (!job) {
                throw new ReferenceError(
                    `bad argument #0 to 'jobs.track' (job '${identifier}' is not valid)`
                );
            }

            const {identifier: notification_identifier} = notifications.push({
                namespace: "jobs-tracking-uninitialized",
                tokens: job,

                on_remove,
            });

            function update(): void {
                // HACK: We're relying reference check at the top of the function
                // remaining valid through entire lifecycle
                const job = find("identifier", identifier)!;

                switch (job.state) {
                    case JOB_STATES.encoding:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Film,

                            namespace: "jobs-tracking-encoding",
                            tokens: job,
                        });

                        break;

                    case JOB_STATES.rendering:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Film,

                            namespace: "jobs-tracking-rendering",
                            tokens: job,
                        });

                        break;

                    case JOB_STATES.ended:
                        notifications.update("identifier", notification_identifier, {
                            //icon: Check,
                            is_dismissible: true,

                            namespace: "jobs-tracking-ended",
                            tokens: job,
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
            const job = find("identifier", identifier);

            if (!job) {
                throw new ReferenceError(
                    `bad argument #0 to 'jobs.yield' (job '${identifier}' is not valid)`
                );
            }

            if (job.state === JOB_STATES.ended) {
                throw new TypeError(
                    `bad argument #0 'jobs.yield' (job '${identifier}' already ended)`
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
