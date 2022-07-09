import type {TypeObjectLiteral} from "@svelte-in-motion/type";
import {validate} from "@svelte-in-motion/type";
import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export interface ICommandItem extends ICollectionItem {
    identifier: string;

    is_disabled?: boolean | (() => boolean);

    is_visible?: boolean | (() => boolean);

    type?: TypeObjectLiteral;

    on_execute: <T>(app: IAppContext, args?: T) => void | Promise<void>;
}

export interface ICommandTypedItem extends ICommandItem {
    type: TypeObjectLiteral;

    on_execute: <T>(app: IAppContext, args: T) => void | Promise<void>;
}

export interface ICommandsStore extends ICollectionStore<ICommandItem | ICommandTypedItem> {
    execute: <T>(command: string, args?: T) => void | Promise<void>;
}

export function commands(app: IAppContext): ICommandsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<ICommandItem>();

    return {
        execute<T>(identifier: string, args: T) {
            const item = find("identifier", identifier);
            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'commands.execute' (command '${identifier}' not found)`
                );
            }

            if (item.type) {
                const [first_error] = validate(args, item.type);
                if (first_error) {
                    throw new Error(first_error.message);
                }
            }

            item.on_execute<T>(app, args);
        },

        find,
        has,

        push,
        subscribe,

        remove,
        update,
        watch,
    };
}
