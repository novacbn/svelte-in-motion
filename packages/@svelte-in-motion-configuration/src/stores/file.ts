import type {IDriver} from "@svelte-in-motion/storage";
import {file_text} from "@svelte-in-motion/storage";
import {derived, get} from "svelte/store";

import type {
    IConfigurationArray,
    IConfigurationReader,
    IConfigurationRecord,
} from "../configurations/configuration";

export interface IFileConfigurationStore<T extends IConfigurationArray | IConfigurationRecord> {
    set: (value: T) => void;

    subscribe: (callback: (value: T) => void) => () => void;

    update: (callback: (value: T) => T) => void;
}

export function file_configuration<T extends IConfigurationArray | IConfigurationRecord>(
    driver: IDriver,
    reader: IConfigurationReader<T>,
    file_path: string,
    debounce?: number
): IFileConfigurationStore<T> {
    const store = file_text(driver, file_path, debounce);

    const parsed = derived(store, ($file_text) => {
        if ($file_text) return reader.parse($file_text);

        // HACK: If supported, `validate` will supply defaults
        return reader.validate();
    });

    return {
        set(configuration) {
            const text = reader.stringify(configuration);

            store.set(text);
        },

        subscribe: parsed.subscribe,

        update(updater) {
            const configuration = updater(structuredClone(get(parsed)));

            this.set(configuration);
        },
    };
}

export function preload_configuration<T extends IConfigurationArray | IConfigurationRecord>(
    driver: IDriver,
    reader: IConfigurationReader<T>,
    file_path: string,
    debounce?: number
): Promise<IFileConfigurationStore<T>> {
    return new Promise((resolve, reject) => {
        const store = file_configuration(driver, reader, file_path, debounce);

        const destroy = store.subscribe((configuration) => {
            if (configuration !== undefined) {
                destroy();
                resolve(store);
            }
        });
    });
}
