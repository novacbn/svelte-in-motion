import type {IEventCallback, IEventNotifier, IEventUnsubscriber} from "./event";
import {event} from "./event";

export interface IMessageEventTarget {
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
}

export interface IMessageEvent<T> {
    dispatch: (message: T, transfer?: Transferable[], origin?: string) => void;

    subscribe: (run: IEventCallback<T>) => IEventUnsubscriber;
}

export interface IPortEventTarget extends IMessageEventTarget {
    postMessage: (message: any, transfer?: Transferable[]) => void;
}

export interface IWindowEventTarget extends IMessageEventTarget {
    postMessage: (message: any, targetOrigin: string, transfer?: Transferable[]) => void;
}

export function message<T>(
    target: IPortEventTarget | IWindowEventTarget,
    start?: IEventNotifier<T>
): IMessageEvent<T> {
    const {subscribe} = event<T>((dispatch) => {
        function on_message(event: MessageEvent) {
            dispatch(event.data);
        }

        target.addEventListener("message", on_message);

        let destroy = start ? start(dispatch) : null;

        return () => {
            target.removeEventListener("message", on_message);

            if (destroy) {
                destroy();
                destroy = null;
            }
        };
    });

    return {
        dispatch(detail, transfer, origin = location.origin) {
            if (typeof window === "object" && target === window) {
                window.postMessage(detail, origin, transfer);
            } else (target as IPortEventTarget).postMessage(detail, transfer);
        },

        subscribe,
    };
}
