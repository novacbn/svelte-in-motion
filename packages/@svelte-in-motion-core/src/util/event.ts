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
    const subscribers: Set<IEventSubscriber<T>> = new Set();

    let stop: IEventUnsubscriber | null;

    const dispatch = (detail: T) => {
        for (const [run] of subscribers) run(detail);
    };

    const subscribe = (run: IEventCallback<T>) => {
        const subscriber: IEventSubscriber<T> = [run];

        subscribers.add(subscriber);
        if (start && subscribers.size === 1) stop = start(dispatch);

        return () => {
            subscribers.delete(subscriber);

            if (stop && subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    };

    return {dispatch, subscribe};
}
