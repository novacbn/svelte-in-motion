import {ControllerSymbol} from "@svelte-in-motion/rpc";

export const IRPCEncodingAgentController =
    ControllerSymbol<IRPCEncodingAgentController>("Encoding.Agent");
export interface IRPCEncodingAgentController {
    get_version(): Promise<string>;
}
