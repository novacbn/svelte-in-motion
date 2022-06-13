import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

export type ICommandArguments = Record<string, string | undefined>;

export interface ICommand extends ICollectionItem {
    identifier: string;

    on_execute: (args: ICommandArguments) => void;
}

export interface ICommandsStore extends ICollectionStore<ICommand> {
    execute: (command: string, args: ICommandArguments) => void;
}

export function commands(): ICommandsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<ICommand>();

    return {
        execute(identifier, args) {
            const item = find("identifier", identifier);
            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'commands.execute' (command '${identifier}' not found)`
                );
            }

            item.on_execute(args);
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
