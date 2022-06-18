import {ICodecNames, IEncodingOptions} from "@svelte-in-motion/encoding";
import {ControllerSymbol} from "@svelte-in-motion/rpc";
import {UUID} from "@svelte-in-motion/type";

export const IRPCEncodingAgentController =
    ControllerSymbol<IRPCEncodingAgentController>("Encoding.Agent");
export interface IRPCEncodingAgentController {
    cancel_job(identifier: UUID): Promise<void>;

    get_available_codecs(): Promise<ICodecNames[]>;

    get_available_crf_range(codec: ICodecNames): Promise<[number, number]>;

    get_available_dimensions_ranges(
        codec: ICodecNames
    ): Promise<[[number, number], [number, number]]>;

    get_available_framerate_range(
        codec: ICodecNames,
        width: number,
        height: number
    ): Promise<[number, number]>;

    get_default_codec(): Promise<ICodecNames>;

    get_default_crf(codec: ICodecNames): Promise<number>;

    get_default_dimensions(codec: ICodecNames): Promise<number>;

    get_default_framerate(codec: ICodecNames, width: number, height: number): Promise<number>;

    get_agent_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number]>;

    start_job(options: IEncodingOptions): Promise<UUID>;
}
