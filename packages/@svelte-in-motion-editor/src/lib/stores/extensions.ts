import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export interface IExtension extends ICollectionItem {
    identifier: string;

    is_builtin?: boolean;

    on_activate?: (app: IAppContext) => void;
}

export interface IExtensionsStore extends ICollectionStore<IExtension> {}

export function extensions(app: IAppContext): IExtensionsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<IExtension>();

    return {
        find,
        has,

        push(item) {
            if (item.on_activate) item.on_activate(app);
            return push(item);
        },

        subscribe,
        remove,
        update,
        watch,
    };
}
