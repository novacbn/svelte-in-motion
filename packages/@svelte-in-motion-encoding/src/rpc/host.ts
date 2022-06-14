import {ControllerSymbol} from "@svelte-in-motion/rpc";
import {UUID} from "@svelte-in-motion/type";

export const IRPCEncodingHostController =
    ControllerSymbol<IRPCEncodingHostController>("Encoding.Host");
export interface IRPCEncodingHostController {
    JOB_END(identifier: UUID, video: Uint8Array): Promise<void>;

    JOB_PROGRESS(identifier: UUID, completion: number): Promise<void>;

    JOB_START(identifier: UUID): Promise<void>;

    get_host_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number, number]>;
}
