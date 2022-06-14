import {ControllerSymbol, rpc} from "@svelte-in-motion/rpc";

export const IRPCEncodingAgentController =
    ControllerSymbol<IRPCEncodingAgentController>("Encoding.Agent");
export interface IRPCEncodingAgentController {
    get_version(): Promise<string>;
}

@rpc.controller(IRPCEncodingAgentController)
export class RPCEncodingAgentController implements IRPCEncodingAgentController {
    async get_version(): Promise<string> {
        return "0.0.0";
    }
}
