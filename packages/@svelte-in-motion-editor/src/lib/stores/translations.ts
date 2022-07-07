import {FluentBundle, FluentResource} from "@fluent/bundle";
import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import {debounce} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export type ITranslationTokens = Record<string, any>;

export interface ITranslationsHandle {
    format(identifier: string, tokens?: ITranslationTokens): string;

    has(identifier: string): boolean;
}

export type ITranslationsStore = Readable<ITranslationsHandle>;

const DEFAULT_HANDLE: ITranslationsHandle = {
    format: (identifier) => identifier,
    has: () => false,
};

export function translations(app: IAppContext): ITranslationsStore {
    const {locale} = app;

    const on_update = debounce(
        async ($locale: string, set: (value: ITranslationsHandle) => void) => {
            const url = new URL(`/locales/${$locale}.ftl`, import.meta.url);
            const response = await fetch(url);

            const text = await response.text();
            const resource = new FluentResource(text);

            const bundle = new FluentBundle($locale);
            bundle.addResource(resource);

            set({
                format: (identifier, tokens) => {
                    const message = bundle.getMessage(identifier);
                    if (message && message.value) {
                        return bundle.formatPattern(message.value, tokens);
                    }

                    return identifier;
                },

                has: (identifier) => {
                    return bundle.hasMessage(identifier);
                },
            });
        }
    );

    return derived(
        [locale],
        ([$locale], set) => {
            on_update($locale, set);
        },
        DEFAULT_HANDLE
    );
}
