import {ControllerSymbol} from "@svelte-in-motion/rpc";
import {UUID} from "@svelte-in-motion/type";

export const IRPCRenderingHostController =
    ControllerSymbol<IRPCRenderingHostController>("Rendering.Host");
export interface IRPCRenderingHostController {
    RENDER_END(identifier: UUID, video: Uint8Array): Promise<void>;

    RENDER_PROGRESS(identifier: UUID, completion: number): Promise<void>;

    RENDER_START(identifier: UUID): Promise<void>;

    get_host_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number]>;
}
