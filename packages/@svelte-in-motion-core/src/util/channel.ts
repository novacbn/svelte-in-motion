import type {IEvent, IEventNotifier} from "./event";
import {event} from "./event";

export function channel<T>(name: string, start?: IEventNotifier<T>): IEvent<T> {
    let channel: BroadcastChannel | null = null;

    const {dispatch, subscribe} = event<T>((dispatch) => {
        function on_message(event: MessageEvent) {
            dispatch(event.data);
        }

        // NOTE: We need a scope aware copy of the `BroadcastChannel` so we don't
        // close channels that wasn't specific to this scope

        let scoped_channel = (channel = new BroadcastChannel(name));
        scoped_channel.addEventListener("message", on_message);

        const destroy = start ? start(dispatch) : null;

        return () => {
            if (scoped_channel) {
                if (destroy) destroy();

                scoped_channel.removeEventListener("message", on_message);
                scoped_channel.close();
            }
        };
    });

    return {
        dispatch(detail) {
            if (channel) {
                dispatch(detail);
                channel.postMessage(detail);
            }
        },

        subscribe,
    };
}
