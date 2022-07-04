import {FluentBundle, FluentResource} from "@fluent/bundle";
import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import {debounce} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export type ITranslationFunction = (identifier: string, parameters?: Record<string, any>) => string;

export type ITranslationStore = Readable<ITranslationFunction>;

export function translations(app: IAppContext): ITranslationStore {
    const {locale} = app;

    const on_update = debounce(
        async ($locale: string, set: (value: ITranslationFunction) => void) => {
            const url = new URL(`/locales/${$locale}.ftl`, import.meta.url);
            const response = await fetch(url);

            const text = await response.text();
            const resource = new FluentResource(text);

            const bundle = new FluentBundle($locale);
            bundle.addResource(resource);

            set((identifier, parameters) => {
                const message = bundle.getMessage(identifier);
                if (message && message.value) {
                    return bundle.formatPattern(message.value, parameters);
                }

                return identifier;
            });
        }
    );

    return derived(
        [locale],
        ([$locale], set) => {
            on_update($locale, set);
        },
        (identifier) => identifier
    );
}
