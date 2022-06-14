import {ControllerSymbol} from "@svelte-in-motion/rpc";

export const IRPCEncodingHostController =
    ControllerSymbol<IRPCEncodingHostController>("Encoding.Host");
export interface IRPCEncodingHostController {
    get_version(): Promise<string>;
}
