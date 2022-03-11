import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
import type {SvelteComponent} from "svelte";

import type {ICollectionItem, ICollectionStore} from "./collection";
import {collection} from "./collection";

export interface INotification extends ICollectionItem {
    dismissible?: boolean;

    icon?: typeof SvelteComponent;

    header: string;

    palette?: PROPERTY_PALETTE;

    text?: string;

    on_remove?: (notification: INotification) => void;
}

export interface INotificationStore extends ICollectionStore<INotification> {}

function _notifications(): INotificationStore {
    const {get, has, push, subscribe, remove, update} = collection<INotification>();

    return {
        get,
        has,
        push,
        subscribe,

        remove(identifier) {
            const notification = remove(identifier);

            if (notification.on_remove) notification.on_remove(notification);
            return notification;
        },

        update,
    };
}

export const notifications: INotificationStore = _notifications();
