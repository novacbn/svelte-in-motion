import type {LanguageSupport} from "@codemirror/language";

import type {ICollectionItem, ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

export interface IGrammarItem extends ICollectionItem {
    identifier: string;

    extensions: string[];

    grammar: LanguageSupport;
}

export interface IGrammarsStore extends ICollectionStore<IGrammarItem> {}

export function grammars(): IGrammarsStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<IGrammarItem>();

    return {
        find,
        has,

        push,
        subscribe,

        remove,
        update,
        watch,
    };
}
