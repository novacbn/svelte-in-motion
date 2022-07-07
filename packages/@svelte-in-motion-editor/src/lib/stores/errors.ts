//import {Slash} from "lucide-svelte";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection, generate_uuid} from "@svelte-in-motion/utilities";

import type {INotificationsStore} from "./notifications";

export interface IErrorItem extends ICollectionItem {
    identifier: string;

    message: string;

    name: string;

    source: string;
}

export interface IErrorsStore extends ICollectionStore<IErrorItem> {
    push(item: Omit<IErrorItem, "identifier">): IErrorItem;
}

export function errors(notifications: INotificationsStore): IErrorsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<IErrorItem>();

    return {
        find,
        has,

        push(item) {
            notifications.push({
                //icon: Slash,
                palette: "negative",

                dismissible: true,

                header: `Error: ${item.source}`,
                text: `${item.name}: ${item.message}`,
            });

            return push({...item, identifier: generate_uuid()} as IErrorItem);
        },

        subscribe,
        remove,
        update,
        watch,
    };
}
