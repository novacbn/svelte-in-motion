import {Observable} from "rxjs";

import {IRenderingHandle, IRenderingOptions} from "@svelte-in-motion/rendering";
import {render} from "@svelte-in-motion/rendering";
import {ControllerSymbol, rpc} from "@svelte-in-motion/rpc";
import {UUID} from "@svelte-in-motion/type";
import {uuid} from "@svelte-in-motion/type";

import type {Agent} from "../agent";
import type {Host} from "../host";

export enum RENDERING_EVENTS {
    initialize,

    start,

    progress,

    end,
}

interface IRenderJob {
    identifier: UUID;

    handle: IRenderingHandle;

    options: IRenderingOptions;
}

// HACK: DeepKit serialization doesn't work well with extended interfaces, so we
// need to duplicate common properties in the events

export interface IRenderingEndEvent {
    identifier: string;

    type: RENDERING_EVENTS.end;

    result: Uint8Array[];
}

export interface IRenderingInitializeEvent {
    identifier: string;

    type: RENDERING_EVENTS.initialize;
}

export interface IRenderingProgressEvent {
    identifier: string;

    type: RENDERING_EVENTS.progress;

    completion: number;
}

export interface IRenderingStartEvent {
    identifier: string;

    type: RENDERING_EVENTS.start;
}

export const IRPCRenderingAgentController =
    ControllerSymbol<IRPCRenderingAgentController>("Rendering.Agent");
export interface IRPCRenderingAgentController {
    cancel_job(identifier: UUID): Promise<void>;

    get_agent_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number]>;

    start_job(options: IRenderingOptions): Promise<UUID>;

    watch_job(
        identifier: UUID
    ): Observable<
        | IRenderingEndEvent
        | IRenderingInitializeEvent
        | IRenderingProgressEvent
        | IRenderingStartEvent
    >;
}

export const IRPCRenderingHostController =
    ControllerSymbol<IRPCRenderingHostController>("Rendering.Host");
export interface IRPCRenderingHostController {
    get_host_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number]>;
}

@rpc.controller(IRPCRenderingAgentController)
export class RPCRenderingAgentController implements IRPCRenderingAgentController {
    protected jobs: IRenderJob[] = [];

    @rpc.action()
    async cancel_job(identifier: UUID): Promise<void> {
        throw new TypeError("bad dispatch to 'cancel_job' (not implemented)");
    }

    @rpc.action()
    async get_agent_version(): Promise<[number, number, number]> {
        return [0, 0, 1];
    }

    @rpc.action()
    async get_protocol_version(): Promise<[number, number]> {
        return [0, 1];
    }

    @rpc.action()
    async start_job(options: IRenderingOptions): Promise<UUID> {
        const identifier = uuid();
        const handle = render(options);

        this.jobs.push({
            identifier,
            handle,
            options,
        });

        const destroy = handle.EVENT_END.subscribe((detail) => {
            this.jobs = this.jobs.filter((job) => job.identifier !== identifier);

            destroy();
        });

        return identifier;
    }

    @rpc.action()
    watch_job(
        identifier: UUID
    ): Observable<
        | IRenderingEndEvent
        | IRenderingProgressEvent
        | IRenderingStartEvent
        | IRenderingInitializeEvent
    > {
        const job = this.jobs.find((job) => job.identifier === identifier);
        if (!job) {
            throw new ReferenceError(
                `bad argument #0 to 'watch_job' (job '${identifier}' not available)`
            );
        }

        return new Observable((observer) => {
            const {handle} = job;

            const destroy_end = handle.EVENT_END.subscribe((detail) => {
                destroy_end();
                destroy_initialize();
                destroy_progress();
                destroy_start();

                console.log({detail});

                observer.next({
                    identifier,
                    type: RENDERING_EVENTS.end,
                    result: detail,
                });
            });

            const destroy_initialize = handle.EVENT_INITIALIZE.subscribe(() => {
                observer.next({
                    identifier,
                    type: RENDERING_EVENTS.initialize,
                });
            });

            const destroy_progress = handle.EVENT_PROGRESS.subscribe((detail) => {
                observer.next({
                    identifier,
                    type: RENDERING_EVENTS.progress,
                    completion: detail,
                });
            });

            const destroy_start = handle.EVENT_START.subscribe(() => {
                observer.next({
                    identifier,
                    type: RENDERING_EVENTS.start,
                });
            });

            return {
                unsubscribe: () => {
                    destroy_end();
                    destroy_initialize();
                    destroy_progress();
                    destroy_start();
                },
            };
        });
    }
}

@rpc.controller(IRPCRenderingHostController)
export class RPCRenderingHostController implements IRPCRenderingHostController {
    constructor(protected host: Host) {}

    @rpc.action()
    async get_host_version(): Promise<[number, number, number]> {
        return [0, 0, 1];
    }

    @rpc.action()
    async get_protocol_version(): Promise<[number, number]> {
        return [0, 1];
    }
}
