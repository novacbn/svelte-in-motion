import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {IConfiguration} from "@svelte-in-motion/metadata";
import {parse_configuration} from "@svelte-in-motion/metadata";

import type {IContentStore} from "./content";

export type IConfigurationStore = Readable<IConfiguration | null>;

export function configuration(content: IContentStore): IConfigurationStore {
    return derived(content, ($content) => {
        if (!$content) return null;

        try {
            return parse_configuration($content);
        } catch (err) {
            return null;
        }
    });
}
