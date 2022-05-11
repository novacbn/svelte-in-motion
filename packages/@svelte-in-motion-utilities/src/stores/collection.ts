import {getProperty} from "dot-prop";
import type {Readable, Writable} from "svelte/store";
import {derived, get, writable} from "svelte/store";

import {deep_assign} from "../util/object";

export type ICollectionItem = Record<string, any>;

export type IPredicate<T extends ICollectionItem> = IPredicateFunction<T> | IPredicatePath;

export type IPredicateFunction<T extends ICollectionItem> = (item: T) => boolean;

export type IPredicatePath = string;

export interface ICollectionStore<T extends ICollectionItem> extends Readable<T[]> {
    find(predicate: IPredicateFunction<T>): T | null;
    find(predicate: IPredicatePath, value: any): T | null;
    find(predicate: IPredicate<T>, value?: any): T | null;

    has(predicate: IPredicateFunction<T>): boolean;
    has(predicate: IPredicatePath, value: any): boolean;
    has(predicate: IPredicate<T>, value?: any): boolean;

    push(item: T): T;

    remove(predicate: IPredicateFunction<T>): T;
    remove(predicate: IPredicatePath, value: any): T;
    remove(predicate: IPredicate<T>, value?: any): T;

    update(predicate: IPredicateFunction<T>, partial: Partial<T>): T;
    update(predicate: IPredicatePath, value: any, partial: Partial<T>): T;
    update(predicate: IPredicate<T>, value: any | Partial<T>, partial: Partial<T>): T;

    watch(predicate: IPredicateFunction<T>): Readable<T | null>;
    watch(predicate: IPredicatePath, value: any): Readable<T | null>;
    watch(predicate: IPredicate<T>, value?: any): Readable<T | null>;
}

export function collection<T extends ICollectionItem>(
    store: Writable<T[]> = writable([])
): ICollectionStore<T> {
    const {set, subscribe} = store;

    return {
        subscribe,

        find(predicate, value?) {
            const $items = get(store);

            if (typeof predicate === "string") {
                return (
                    $items.find((item) => {
                        const nested_value = getProperty(item, predicate);

                        return nested_value === value;
                    }) ?? null
                );
            }

            return (
                $items.find((item) => {
                    return predicate(item);
                }) ?? null
            );
        },

        has(predicate, value?) {
            const $items = get(store);

            if (typeof predicate === "string") {
                return !!$items.find((item) => {
                    const nested_value = getProperty(item, predicate);

                    return nested_value === value;
                });
            }

            return !!$items.find((item) => {
                return predicate(item);
            });
        },

        push(item) {
            const $items = get(store);

            $items.push(item);
            set($items);

            return item;
        },

        remove(predicate, value?) {
            const $items = get(store);

            let index: number;

            if (typeof predicate === "string") {
                index = $items.findIndex((item) => {
                    const nested_value = getProperty(item, predicate);

                    return nested_value === value;
                });
            } else {
                index = $items.findIndex((item) => {
                    return predicate(item);
                });
            }

            if (index < 0) {
                throw new ReferenceError(
                    `bad argument #0 to 'collection.remove' (predicate not valid)`
                );
            }

            const [item] = $items.splice(index, 1);

            set($items);
            return item;
        },

        update(predicate, value?, partial?) {
            const $items = get(store);

            let index: number;

            if (typeof predicate === "string") {
                index = $items.findIndex((item) => {
                    const nested_value = getProperty(item, predicate);

                    return nested_value === value;
                });
            } else {
                index =
                    $items.findIndex((item) => {
                        return predicate(item);
                    }) ?? null;
            }

            if (index < 0) {
                throw new ReferenceError(
                    `bad argument #0 to 'collection.update' (predicate not valid)`
                );
            }

            const item = deep_assign($items[index], partial ?? value) as T;
            $items[index] = item;

            set($items);
            return item;
        },

        watch(predicate, value?) {
            return derived(store, ($items) => {
                if (typeof predicate === "string") {
                    return (
                        $items.find((item) => {
                            const nested_value = getProperty(item, predicate);

                            return nested_value === value;
                        }) ?? null
                    );
                }

                return (
                    $items.find((item) => {
                        return predicate(item);
                    }) ?? null
                );
            });
        },
    };
}
