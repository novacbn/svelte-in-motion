//import {Slash} from "lucide-svelte";

import type {SvelteComponent} from "svelte";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection, format_snake_case, generate_uuid} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export interface IErrorItem extends ICollectionItem {
    identifier: string;

    icon?: typeof SvelteComponent;

    message: string;

    name: string;

    stack: string;
}

export interface IErrorTypedItem<T> extends IErrorItem {
    tokens: T;
}

export interface IErrorUntypedItem extends IErrorItem {}

export interface IErrorsStore
    extends ICollectionStore<IErrorTypedItem<unknown> | IErrorUntypedItem> {
    push(item: Omit<IErrorTypedItem<unknown> | IErrorUntypedItem, "identifier">): IErrorItem;
}

export function errors(app: IAppContext): IErrorsStore {
    const {notifications} = app;

    const {find, has, push, subscribe, remove, update, watch} = collection<
        IErrorTypedItem<unknown> | IErrorUntypedItem
    >();

    return {
        find,
        has,

        push(item) {
            const {icon, message, name, stack, tokens} = item;

            const error_identifier = generate_uuid();
            const translation_identifier = `errors-${format_snake_case(name)}`;

            notifications.push({
                //icon: item.icon ? item.icon : Slash,
                palette: "negative",
                is_dismissible: true,

                header: `${translation_identifier}-label`,
                text: `${translation_identifier}-description`,

                tokens: stack ? {...(tokens ?? {}), stack} : tokens,

                on_remove: () => remove(error_identifier),
            });

            return push({
                icon,
                identifier: error_identifier,
                message,
                name,
                stack,
            } as IErrorItem);
        },

        subscribe,
        remove,
        update,
        watch,
    };
}
