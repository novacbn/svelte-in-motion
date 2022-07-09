import type {IEvent, IEventNotifier} from "./event";
import {event} from "./event";

export interface IChannelEvent<T> extends IEvent<T> {
    close(): void;
}

export function channel<T>(
    channel: BroadcastChannel | string,
    start?: IEventNotifier<T>
): IChannelEvent<T> {
    channel = typeof channel === "string" ? new BroadcastChannel(channel) : channel;

    const {dispatch, subscribe} = event<T>((dispatch) => {
        function on_message(event: MessageEvent) {
            dispatch(event.data);
        }

        (channel as BroadcastChannel).addEventListener("message", on_message);

        let destroy = start ? start(dispatch) : null;

        return () => {
            (channel as BroadcastChannel).removeEventListener("message", on_message);

            if (destroy) {
                destroy();
                destroy = null;
            }
        };
    });

    return {
        close() {
            (channel as BroadcastChannel).close();
        },

        dispatch(detail) {
            (channel as BroadcastChannel).postMessage(detail);
            dispatch(detail);
        },

        subscribe,
    };
}
