import type {RemoteController, RpcClient} from "@svelte-in-motion/rpc";
import {DirectClient, RpcKernel} from "@svelte-in-motion/rpc";

import {IRPCEncodingAgentController} from "./rpc/encoding";
import {RPCEncodingAgentController} from "./rpc/encoding";

export class Agent {
    public readonly encoding: RemoteController<RPCEncodingAgentController>;

    static async connect_to(): Promise<Agent> {
        // TODO: expand to support configuration for network
        // TODO: expand to support configuration for subprocess

        const kernel = new RpcKernel();
        kernel.registerController(IRPCEncodingAgentController, RPCEncodingAgentController);

        const client = new DirectClient(kernel);
        return new Agent(client);
    }

    constructor(protected client: RpcClient) {
        this.encoding = client.controller(IRPCEncodingAgentController);
    }
}
