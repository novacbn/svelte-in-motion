import {get} from "svelte/store";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

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

    on_bind: (event: IKeybindEvent) => void;
}

export interface IKeybindsStore extends ICollectionStore<IKeybind> {
    execute: (event: KeyboardEvent, is_down: boolean) => void;
}

export function keybinds(): IKeybindsStore {
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

            const items = get(store);

            for (const item of items) {
                const {binds, identifier, repeat: can_repeat = false, repeat_throttle = 0} = item;

                let can_handle = false;
                for (const bind of binds) {
                    if (can_handle) break;

                    for (const bind_key of bind) {
                        if (bind_key.toLowerCase() === key) {
                            can_handle = true;
                            break;
                        }
                    }
                }

                if (!can_handle) break;

                let current_active = false;
                for (const bind of binds) {
                    if (current_active) break;
                    current_active = true;

                    for (const bind_key of bind) {
                        if (!key_lookup.has(bind_key.toLowerCase())) {
                            current_active = false;
                            break;
                        }
                    }
                }

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
                    item.on_bind({
                        active: current_active,
                        repeat,
                    });

                    if (is_repeating) timestamp_lookup.set(identifier, current_timestamp);
                }

                if (current_active) bind_lookup.set(identifier, true);
                else bind_lookup.delete(identifier);

                break;
            }
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
