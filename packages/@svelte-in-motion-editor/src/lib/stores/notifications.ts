import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
import type {SvelteComponent} from "svelte";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection, generate_uuid} from "@svelte-in-motion/utilities";

export interface INotificationItem extends ICollectionItem {
    icon?: typeof SvelteComponent;

    identifier: string;

    is_dismissible?: boolean;

    header: string;

    palette?: PROPERTY_PALETTE;

    text?: string;

    on_remove?: (notification: INotificationItem) => void;
}

export interface INotificationsStore extends ICollectionStore<INotificationItem> {
    push(item: Omit<INotificationItem, "identifier">): INotificationItem;
}

export function notifications(): INotificationsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<INotificationItem>();

    return {
        find,
        has,

        push(item) {
            return push({...item, identifier: generate_uuid()} as INotificationItem);
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
