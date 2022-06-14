import {ControllerSymbol} from "@svelte-in-motion/rpc";
import {UUID} from "@svelte-in-motion/type";

import type {IRenderingOptions} from "../rendering/render";

export const IRPCRenderingAgentController =
    ControllerSymbol<IRPCRenderingAgentController>("Rendering.Agent");
export interface IRPCRenderingAgentController {
    cancel_job(identifier: UUID): Promise<void>;

    get_agent_version(): Promise<[number, number, number]>;

    get_protocol_version(): Promise<[number, number]>;

    start_job(options: IRenderingOptions): Promise<UUID>;
}
