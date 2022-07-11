import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
import type {SvelteComponent} from "svelte";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection, generate_uuid} from "@svelte-in-motion/utilities";

export interface INotificationItem extends ICollectionItem {
    icon?: typeof SvelteComponent;

    identifier: string;

    is_dismissible?: boolean;

    namespace: string;

    palette?: PROPERTY_PALETTE;

    on_remove?: (notification: INotificationItem) => void;
}

export interface INotificationTypedItem<T> extends INotificationItem {
    tokens: T;
}

export interface INotificationUntypedItem extends INotificationItem {}

export interface INotificationsStore
    extends ICollectionStore<INotificationTypedItem<unknown> | INotificationUntypedItem> {
    push(
        item: Omit<INotificationTypedItem<unknown> | INotificationUntypedItem, "identifier">
    ): INotificationItem;
}

export function notifications(): INotificationsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<
        INotificationTypedItem<unknown> | INotificationUntypedItem
    >();

    return {
        find,
        has,

        push(item) {
            const identifier = generate_uuid();

            return push({...item, identifier} as INotificationItem);
        },

        subscribe,

        remove(predicate, value?) {
            const notification = remove(predicate, value);

            if (notification.on_remove) notification.on_remove(notification);
            return notification;
        },

        update,
        watch,
    };
}
