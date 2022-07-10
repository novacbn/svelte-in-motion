import {get} from "svelte/store";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {UserError, collection, format_snake_case} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export type IKeybindBinds = string[][];

export interface IKeybindEvent {
    active: boolean;

    repeat: boolean;
}

export interface IKeybindItem extends ICollectionItem {
    binds: IKeybindBinds;

    identifier: string;

    is_disabled?: boolean | (() => boolean);

    is_visible?: boolean | (() => boolean);

    repeat?: boolean;

    repeat_throttle?: number;

    on_bind: (app: IAppContext, event: IKeybindEvent) => void | Promise<void>;
}

export interface IKeybindsStore extends ICollectionStore<IKeybindItem> {
    execute: (event: KeyboardEvent, is_down: boolean) => Promise<void>;
}

export function keybinds(app: IAppContext): IKeybindsStore {
    const {notifications, prompts, translations} = app;

    const store = collection<IKeybindItem>();
    const {find, has, push, subscribe, remove, update, watch} = store;

    const bind_lookup: Map<string, boolean> = new Map();
    const key_lookup: Map<string, boolean> = new Map();
    const timestamp_lookup: Map<string, number> = new Map();

    return {
        async execute(event, is_down) {
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
                const {
                    binds,
                    identifier,
                    is_disabled = false,
                    repeat: can_repeat = false,
                    repeat_throttle = 0,
                } = item;

                if (!binds.find((bind) => bind.includes(key))) continue;

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
                    if (!is_disabled || (typeof is_disabled === "function" && !is_disabled())) {
                        try {
                            await item.on_bind(app, {
                                active: current_active,
                                repeat,
                            });
                        } catch (err) {
                            if (err instanceof UserError) {
                                const $translations = get(translations);
                                const translation_identifier = `errors-${format_snake_case(
                                    err.name
                                )}`;

                                notifications.push({
                                    icon: err.icon,
                                    is_dismissible: true,

                                    header: $translations.format(
                                        `${translation_identifier}-label`,
                                        err.tokens
                                    ),

                                    text: $translations.format(
                                        `${translation_identifier}-description`,
                                        err.tokens
                                    ),
                                });

                                return;
                            }

                            throw err;
                        }
                    }

                    if (is_repeating) timestamp_lookup.set(identifier, current_timestamp);
                }

                if (current_active) bind_lookup.set(identifier, true);
                else bind_lookup.delete(identifier);

                if (current_active || current_active !== previous_active) break;
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
