import type {Readable} from "svelte/store";
import {get, writable} from "svelte/store";

import {generate_uuid} from "@svelte-in-motion/utilities";

export interface ICollectionItem {
    identifier: string;
}

export interface ICollectionStore<T extends ICollectionItem> extends Readable<T[]> {
    get(identifier: string): T;

    has(identifier: string): boolean;

    push(item: Omit<T, "identifier">): string;

    remove(identifier: string): T;

    update(identifier: string, partial: Omit<Partial<T>, "identifier">): T;
}

export function collection<T extends ICollectionItem>(items: T[] = []): ICollectionStore<T> {
    const store = writable<T[]>(items);
    const {set, subscribe, update} = store;

    return {
        subscribe,

        get(identifier) {
            const items = get(store);
            const item = items.find((_item) => _item.identifier === identifier);

            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'collection.get' (invalid identifer '${identifier}')`
                );
            }

            return item;
        },

        has(identifier) {
            const items = get(store);

            return !!items.find((_item) => _item.identifier === identifier);
        },

        push(item) {
            const identifier = generate_uuid();

            update((items) => [...items, {...item, identifier} as T]);
            return identifier;
        },

        remove(identifier) {
            const items = get(store);
            const index = items.findIndex((_item) => _item.identifier === identifier);

            if (index < 0) {
                throw new ReferenceError(
                    `bad argument #0 to 'collection.remove' (invalid identifer '${identifier}')`
                );
            }

            const [item] = items.splice(index, 1);

            set(items);
            return item;
        },

        update(identifier, partial) {
            const items = get(store);
            const index = items.findIndex((_item) => _item.identifier === identifier);

            if (index < 0) {
                throw new ReferenceError(
                    `bad argument #0 to 'collection.update' (invalid identifer '${identifier}')`
                );
            }

            const item = (items[index] = {...items[index], ...partial});

            set(items);
            return item;
        },
    };
}
