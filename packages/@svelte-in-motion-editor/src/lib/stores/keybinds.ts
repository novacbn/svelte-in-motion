import {get} from "svelte/store";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export type IKeybindBinds = string[][];

export interface IKeybindEvent {
    active: boolean;

    repeat: boolean;
}

export interface IKeybind extends ICollectionItem {
    binds: IKeybindBinds;

    identifier: string;

    repeat?: boolean;

    repeat_throttle?: number;

    on_bind: (app: IAppContext, event: IKeybindEvent) => void;
}

export interface IKeybindsStore extends ICollectionStore<IKeybind> {
    execute: (event: KeyboardEvent, is_down: boolean) => void;
}

export function keybinds(app: IAppContext): IKeybindsStore {
    const {prompts} = app;

    const store = collection<IKeybind>();
    const {find, has, push, subscribe, remove, update, watch} = store;

    const bind_lookup: Map<string, boolean> = new Map();
    const key_lookup: Map<string, boolean> = new Map();
    const timestamp_lookup: Map<string, number> = new Map();

    return {
        execute(event, is_down): void {
            const {repeat} = event;
            const key = event.key.toLowerCase();

            if (is_down) key_lookup.set(key, true);
            else key_lookup.delete(key);

            const active_element = document.activeElement;
            if (
                active_element instanceof HTMLElement &&
                (active_element.isContentEditable ||
                    active_element.matches("input:not([disabled], [readonly])"))
            ) {
                return;
            }

            const prompt = get(prompts);
            if (prompt) return;

            const items = get(store);
            for (const item of items) {
                const {binds, identifier, repeat: can_repeat = false, repeat_throttle = 0} = item;

                const can_handle = !!binds.find((bind) => bind.includes(key));
                if (can_handle) {
                    const current_active = binds.some((binds) =>
                        binds.every((key) => key_lookup.has(key))
                    );
                    const previous_active = bind_lookup.has(identifier);

                    if (current_active) {
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (can_repeat) timestamp_lookup.delete(identifier);

                    const current_timestamp = Date.now();
                    const is_repeating = repeat && can_repeat;

                    if (is_repeating) {
                        const previous_timestamp = timestamp_lookup.get(identifier) ?? 0;
                        if (current_timestamp - previous_timestamp < repeat_throttle) {
                            break;
                        }
                    }

                    if (current_active !== previous_active || is_repeating) {
                        item.on_bind(app, {
                            active: current_active,
                            repeat,
                        });

                        if (is_repeating) timestamp_lookup.set(identifier, current_timestamp);
                    }

                    if (current_active) bind_lookup.set(identifier, true);
                    else bind_lookup.delete(identifier);

                    if (current_active || current_active !== previous_active) break;
                }
            }
        },

        find,
        has,

        push(item) {
            return push({
                ...item,
                binds: item.binds.map((bind) => bind.map((key) => key.toLowerCase())),
            });
        },

        subscribe,

        remove,
        update,
        watch,
    };
}
