/**
 * Represents the callback supplied by subscribers to be called every dispatch
 */
export type IEventCallback<T> = (detail: T) => void;

/**
 * Reprevents the function used to dispatch events into the bus
 */
export type IEventDispatch<T> = (detail: T) => void;

/**
 * Represents the notification subscription used whenever a first subscription is added
 */
export type IEventNotifier<T> = (dispatch: IEventDispatch<T>) => IEventUnsubscriber;

/**
 * Represents the unsubscribe function returned by [[IEvent.subscribe]]
 */
export type IEventUnsubscriber = () => void;

/**
 * Represents the tuple that internally represents a subscription
 */
type IEventSubscriber<T> = [IEventCallback<T>];

/**
 * Represents an interface to publish event data via a singleton instance, that is compatible with Svelte Store subscriptions
 */
export interface IEvent<T> {
    /**
     * Dispatches new event details to every subscriber
     * @param details
     */
    dispatch: IEventDispatch<T>;

    /**
     * Subscribes to new incoming event dispatches
     * @param run
     */
    subscribe: (run: IEventCallback<T>) => IEventUnsubscriber;
}

/**
 * Returns a new [[IEvent]] instance, for handling event publishing in non-DOM related contexts
 *
 * @param start
 */
export function event<T>(start?: IEventNotifier<T>): IEvent<T> {
    const subscribers: IEventSubscriber<T>[] = [];

    let stop: IEventUnsubscriber | null;

    const dispatch = (details: T) => {
        if (subscribers.length > 0) {
            for (let index = 0; index < subscribers.length; index++) {
                const [run] = subscribers[index];

                run(details);
            }
        }
    };

    const subscribe = (run: IEventCallback<T>) => {
        const subscriber: IEventSubscriber<T> = [run];

        subscribers.push(subscriber);
        if (start && subscribers.length === 1) stop = start(dispatch);

        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index > 0) {
                subscribers.splice(index, 1);

                if (stop && subscribers.length == 0) {
                    stop();
                    stop = null;
                }
            }
        };
    };

    return {dispatch, subscribe};
}
