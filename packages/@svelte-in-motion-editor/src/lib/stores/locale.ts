import {negotiateLanguages} from "@fluent/langneg";
import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import {DEFAULT_LOCALE, SUPPORTED_LOCALES} from "@svelte-in-motion/configuration";

import type {IAppContext} from "../app";

export type ILocaleStore = Readable<string>;

export function locale(app: IAppContext): ILocaleStore {
    const {preferences} = app;

    return derived([preferences], ([$preferences]) => {
        return (
            $preferences.locale.preferred ??
            negotiateLanguages(navigator.languages, SUPPORTED_LOCALES, {
                defaultLocale: DEFAULT_LOCALE,
            })[0]
        );
    });
}
