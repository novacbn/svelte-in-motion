import type {InjectorContext} from "@deepkit/injector";
import type {
    ClientTransportAdapter,
    RpcKernelBaseConnection,
    TransportConnectionHooks,
} from "@deepkit/rpc";
import {RpcClient, RpcKernel} from "@deepkit/rpc";

export type IMessageEventTarget = {
    addEventListener: (
        type: "error",
        listener: (this: EventTarget, ev: ErrorEvent) => any,
        options?: boolean | AddEventListenerOptions
    ) => void;

    removeEventListener: (
        type: "error",
        listener: (this: EventTarget, ev: ErrorEvent) => any,
        options?: boolean | EventListenerOptions
    ) => void;
} & {
    addEventListener: (
        type: "message",
        listener: (this: EventTarget, ev: MessageEvent<any>) => any,
        options?: boolean | AddEventListenerOptions
    ) => void;

    removeEventListener: (
        type: "message",
        listener: (this: EventTarget, ev: MessageEvent<any>) => any,
        options?: boolean | EventListenerOptions
    ) => void;
};

export interface IWindowEventTarget extends IMessageEventTarget {
    postMessage: (message: any, targetOrigin: string, transfer?: Transferable[]) => void;
}

export interface IWorkerEventTarget extends IMessageEventTarget {
    postMessage: (message: any, transfer: Transferable[]) => void;
}

export type IPortEventTarget = IWindowEventTarget | IWorkerEventTarget;

function post_port(port: IPortEventTarget, message: Uint8Array): void {
    if (typeof window === "object" && port === window) {
        (port as IWindowEventTarget).postMessage(message, location.origin, [message.buffer]);
    } else (port as IWorkerEventTarget).postMessage(message, [message.buffer]);
}

export class RpcPortClient extends RpcClient {
    constructor(port: IPortEventTarget) {
        super(new RpcPortClientAdapter(port));
    }
}

export class RpcPortClientAdapter implements ClientTransportAdapter {
    constructor(protected port: IPortEventTarget) {}

    public async connect(hooks: TransportConnectionHooks): Promise<void> {
        const {port} = this;

        const on_error = (event: ErrorEvent): void => {
            hooks.onError(event);
        };

        const on_message = (event: MessageEvent<Uint8Array>): void => {
            hooks.onData(event.data);
        };

        hooks.onConnected({
            clientAddress: () => {
                return "port";
            },

            close: () => {
                port.removeEventListener("error", on_error);
                port.removeEventListener("message", on_message);
            },

            send: (message) => {
                post_port(port, message);
            },
        });

        port.addEventListener("error", on_error);
        port.addEventListener("message", on_message);
    }
}

export class RpcPortServer {
    protected connection?: RpcKernelBaseConnection;

    constructor(
        protected port: IPortEventTarget,
        protected kernel: RpcKernel,
        protected injector?: InjectorContext
    ) {}

    public close() {
        this.connection?.close();
    }

    public async start(): Promise<void> {
        const {kernel, injector, port} = this;

        const on_error = (event: ErrorEvent): void => {
            connection.close();
        };

        const on_message = (event: MessageEvent<Uint8Array>): void => {
            connection.feed(event.data);
        };

        const connection = (this.connection = kernel.createConnection(
            {
                clientAddress: () => {
                    return "port";
                },

                close: () => {
                    port.removeEventListener("error", on_error);
                    port.removeEventListener("message", on_message);
                },

                write: (message) => {
                    post_port(port, message);
                },
            },
            injector
        ));

        port.addEventListener("error", on_error);
        port.addEventListener("message", on_message);
    }
}
