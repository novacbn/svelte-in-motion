import {Observable} from "rxjs";

import {
    ICodecNames,
    IEncodingHandle,
    IEncodingOptions,
    IPixelFormatNames,
} from "@svelte-in-motion/encoding";
import {
    encode,
    get_available_codecs,
    get_available_crf_range,
    get_available_dimensions_ranges,
    get_available_framerate_range,
    get_available_pixel_formats,
    get_default_codec,
    get_default_crf,
    get_default_dimensions,
    get_default_framerate,
    get_default_pixel_format,
} from "@svelte-in-motion/encoding";
import {ControllerSymbol, rpc} from "@svelte-in-motion/rpc";
import {UUID} from "@svelte-in-motion/type";
import {uuid} from "@svelte-in-motion/type";

import type {Agent} from "../agent";
import type {Host} from "../host";

export enum ENCODING_EVENTS {
    initialize,

    start,

    progress,

    end,
}

interface IEncodeJob {
    identifier: UUID;

    handle: IEncodingHandle;

    options: IEncodingOptions;
}

export interface IAvailableCodecConfiguration {
    crf_range: [number, number];

    dimensions_ranges: [[number, number], [number, number]];

    framerate_range: [number, number];

    pixel_formats: IPixelFormatNames[];
}

export interface ICodecConfiguration {
    crf: number;

    dimensions: [number, number];

    framerate: number;

    pixel_format: IPixelFormatNames;
}

// HACK: DeepKit serialization doesn't work well with extended interfaces, so we
// need to duplicate common properties in the events

export interface IEncodingEndEvent {
    identifier: string;

    type: ENCODING_EVENTS.end;

    result: Uint8Array;
}

export interface IEncodingInitializeEvent {
    identifier: string;

    type: ENCODING_EVENTS.initialize;
}

export interface IEncodingProgressEvent {
    identifier: string;

    type: ENCODING_EVENTS.progress;

    completion: number;
}

export interface IEncodingStartEvent {
    identifier: string;

    type: ENCODING_EVENTS.start;
}

export const IRPCEncodingAgentController =
    ControllerSymbol<IRPCEncodingAgentController>("Encoding.Agent");
export interface IRPCEncodingAgentController {
    cancel_job(identifier: UUID): Promise<void>;

    get_agent_version(): Promise<[number, number, number]>;

    get_available_codecs(): Promise<ICodecNames[]>;

    get_available_codec_configuration(codec: ICodecNames): Promise<IAvailableCodecConfiguration>;

    get_default_codec(): Promise<ICodecNames>;

    get_default_codec_configuration(codec: ICodecNames): Promise<ICodecConfiguration>;

    get_protocol_version(): Promise<[number, number]>;

    start_job(options: IEncodingOptions): Promise<UUID>;

    watch_job(
        identifier: UUID
    ): Observable<
        IEncodingEndEvent | IEncodingInitializeEvent | IEncodingProgressEvent | IEncodingStartEvent
    >;
}

export const IRPCEncodingHostController =
    ControllerSymbol<IRPCEncodingHostController>("Encoding.Host");
export interface IRPCEncodingHostController {
    get_host_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number]>;
}

@rpc.controller(IRPCEncodingAgentController)
export class RPCEncodingAgentController implements IRPCEncodingAgentController {
    protected jobs: IEncodeJob[] = [];

    @rpc.action()
    async cancel_job(identifier: UUID): Promise<void> {
        throw new TypeError("bad dispatch to 'cancel_job' (not implemented)");
    }

    @rpc.action()
    async get_agent_version(): Promise<[number, number, number]> {
        return [0, 0, 1];
    }

    @rpc.action()
    async get_available_codecs(): Promise<ICodecNames[]> {
        return get_available_codecs();
    }

    @rpc.action()
    async get_available_codec_configuration(
        codec: ICodecNames
    ): Promise<IAvailableCodecConfiguration> {
        const crf_range = get_available_crf_range(codec);
        const dimensions_ranges = get_available_dimensions_ranges(codec);
        const framerate_range = get_available_framerate_range(codec);
        const pixel_formats = get_available_pixel_formats(codec);

        return {
            crf_range,
            dimensions_ranges,
            framerate_range,
            pixel_formats,
        };
    }

    @rpc.action()
    async get_default_codec(): Promise<ICodecNames> {
        return get_default_codec();
    }

    @rpc.action()
    async get_default_codec_configuration(codec: ICodecNames): Promise<ICodecConfiguration> {
        const crf = get_default_crf(codec);
        const dimensions = get_default_dimensions(codec);
        const framerate = get_default_framerate(codec);
        const pixel_format = get_default_pixel_format(codec);

        return {crf, dimensions, framerate, pixel_format};
    }

    @rpc.action()
    async get_protocol_version(): Promise<[number, number]> {
        return [0, 1];
    }

    @rpc.action()
    async start_job(options: IEncodingOptions): Promise<UUID> {
        const identifier = uuid();
        const handle = encode(options);

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
        IEncodingEndEvent | IEncodingInitializeEvent | IEncodingProgressEvent | IEncodingStartEvent
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

                observer.next({
                    identifier,
                    type: ENCODING_EVENTS.end,
                    result: detail,
                });
            });

            const destroy_initialize = handle.EVENT_INITIALIZE.subscribe(() => {
                observer.next({
                    identifier,
                    type: ENCODING_EVENTS.initialize,
                });
            });

            const destroy_progress = handle.EVENT_PROGRESS.subscribe((detail) => {
                observer.next({
                    identifier,
                    type: ENCODING_EVENTS.progress,
                    completion: detail,
                });
            });

            const destroy_start = handle.EVENT_START.subscribe(() => {
                observer.next({
                    identifier,
                    type: ENCODING_EVENTS.start,
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

@rpc.controller(IRPCEncodingHostController)
export class RPCEncodingHostController implements IRPCEncodingHostController {
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
