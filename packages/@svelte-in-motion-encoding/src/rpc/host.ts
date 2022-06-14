import {ControllerSymbol, rpc} from "@svelte-in-motion/rpc";

export const IRPCEncodingHostController =
    ControllerSymbol<IRPCEncodingHostController>("Encoding.Host");
export interface IRPCEncodingHostController {
    get_version(): Promise<string>;
}

@rpc.controller(IRPCEncodingHostController)
export class RPCEncodingHostController implements IRPCEncodingHostController {
    async get_version(): Promise<string> {
        return "0.0.0";
    }
}
