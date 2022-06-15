import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export type ICommandArguments = Record<string, string | undefined>;

export interface ICommand extends ICollectionItem {
    identifier: string;

    is_visible?: boolean;

    on_execute: <T extends ICommandArguments | undefined = undefined>(
        app: IAppContext,
        args: T
    ) => void;
}

export interface ICommandsStore extends ICollectionStore<ICommand> {
    execute: <T extends ICommandArguments | undefined = undefined>(
        command: string,
        args?: T
    ) => void;
}

export function commands(app: IAppContext): ICommandsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<ICommand>();

    return {
        execute<T extends ICommandArguments | undefined = undefined>(identifier: string, args: T) {
            const item = find("identifier", identifier);
            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'commands.execute' (command '${identifier}' not found)`
                );
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
