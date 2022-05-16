import {Slash} from "lucide-svelte";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection, generate_uuid} from "@svelte-in-motion/utilities";

import type {INotificationsStore} from "./notifications";

export interface IError extends ICollectionItem {
    identifier: string;

    message: string;

    name: string;

    source: string;
}

export interface IErrorsStore extends ICollectionStore<IError> {
    push(item: Omit<IError, "identifier">): IError;
}

export function errors(notifications: INotificationsStore): IErrorsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<IError>();

    return {
        find,
        has,

        push(item) {
            notifications.push({
                icon: Slash,
                palette: "negative",

                header: `Error: ${item.source}`,
                text: `${item.name}: ${item.message}`,
            });

            return push({...item, identifier: generate_uuid()} as IError);
        },

        subscribe,
        remove,
        update,
        watch,
    };
}
