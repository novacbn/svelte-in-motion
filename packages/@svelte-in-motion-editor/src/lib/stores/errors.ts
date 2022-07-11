//import {Slash} from "lucide-svelte";

import type {SvelteComponent} from "svelte";

import type {
    ICollectionItem,
    ICollectionStore,
    TranslatedError,
    UserError,
} from "@svelte-in-motion/utilities";
import {collection, format_snake_case, generate_uuid} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export interface IErrorItem extends ICollectionItem {
    identifier: string;

    icon?: typeof SvelteComponent;

    error: Error | TranslatedError | UserError;
}

export interface IErrorsStore extends ICollectionStore<IErrorItem> {
    push(item: Omit<IErrorItem, "identifier">): IErrorItem;
}

export function errors(app: IAppContext): IErrorsStore {
    const {notifications} = app;

    const {find, has, push, subscribe, remove, update, watch} = collection<IErrorItem>();

    return {
        find,
        has,

        push(item) {
            const {error} = item;
            const error_identifier = generate_uuid();

            const translation_identifier = `errors-${format_snake_case(error.name)}`;

            notifications.push({
                //icon: item.icon ? item.icon : Slash,
                palette: "negative",

                is_dismissible: true,

                header: `${translation_identifier}-label`,
                text: `${translation_identifier}-description`,

                on_remove: () => remove(error_identifier),
            });

            return push({...item, identifier: error_identifier} as IErrorItem);
        },

        subscribe,
        remove,
        update,
        watch,
    };
}
