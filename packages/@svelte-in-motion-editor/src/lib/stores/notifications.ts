import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
import type {SvelteComponent} from "svelte";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection, generate_uuid} from "@svelte-in-motion/utilities";

export interface INotification extends ICollectionItem {
    dismissible?: boolean;

    icon?: typeof SvelteComponent;

    identifier: string;

    header: string;

    palette?: PROPERTY_PALETTE;

    text?: string;

    on_remove?: (notification: INotification) => void;
}

export interface INotificationsStore extends ICollectionStore<INotification> {
    push(item: Omit<INotification, "identifier">): INotification;
}

export function notifications(): INotificationsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<INotification>();

    return {
        find,
        has,

        push(item) {
            return push({...item, identifier: generate_uuid()} as INotification);
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
