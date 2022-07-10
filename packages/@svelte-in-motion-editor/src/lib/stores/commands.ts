import {get} from "svelte/store";

import type {TypeObjectLiteral} from "@svelte-in-motion/type";
import {validate} from "@svelte-in-motion/type";
import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {UserError, collection, format_snake_case} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export interface ICommandItem extends ICollectionItem {
    identifier: string;

    is_disabled?: boolean | (() => boolean);

    is_visible?: boolean | (() => boolean);
}

export interface ICommandTypedItem<T> extends ICommandItem {
    type: TypeObjectLiteral;

    on_execute: (app: IAppContext, args: T) => void | Promise<void>;
}

export interface ICommandUntypedItem extends ICommandItem {
    on_execute: (app: IAppContext) => void | Promise<void>;
}

export interface ICommandsStore
    extends ICollectionStore<ICommandTypedItem<unknown> | ICommandUntypedItem> {
    execute: ((command: string) => Promise<void>) &
        (<T>(command: string, args: T) => Promise<void>);

    push: ((item: ICommandUntypedItem) => ICommandUntypedItem) &
        (<T>(item: ICommandTypedItem<T>) => ICommandTypedItem<T>);
}

export function commands(app: IAppContext): ICommandsStore {
    const {notifications, translations} = app;

    const {find, has, push, subscribe, remove, update, watch} = collection<
        ICommandTypedItem<unknown> | ICommandUntypedItem
    >();

    return {
        // @ts-expect-error
        async execute<T>(identifier: string, args: T) {
            const item = find("identifier", identifier);
            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'commands.execute' (command '${identifier}' not found)`
                );
            }

            if ("type" in item) {
                const [first_error] = validate(args, item.type);
                if (first_error) {
                    throw new Error(first_error.message);
                }
            }

            try {
                await item.on_execute(app, args);
            } catch (err) {
                if (err instanceof UserError) {
                    const $translations = get(translations);
                    const translation_identifier = `errors-${format_snake_case(err.name)}`;

                    notifications.push({
                        icon: err.icon,
                        is_dismissible: true,

                        header: $translations.format(`${translation_identifier}-label`, err.tokens),
                        text: $translations.format(
                            `${translation_identifier}-description`,
                            err.tokens
                        ),
                    });

                    return;
                }

                throw err;
            }
        },

        find,
        has,

        // @ts-expect-error
        push,
        subscribe,

        remove,
        update,
        watch,
    };
}
