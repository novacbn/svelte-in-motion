import type {Readable, Writable} from "svelte/store";
import {derived, get} from "svelte/store";

import type {IDriver} from "@svelte-in-motion/storage";
import {file_text} from "@svelte-in-motion/storage";
import type {IDataClassParseOptions, IDataClassStringifyOptions} from "@svelte-in-motion/type";
import {DataClass} from "@svelte-in-motion/type";

export type IConfigurationFileStore<T extends Configuration> = Writable<T | null>;

export type IPreloadedConfigurationFileStore<T extends Configuration> = Writable<T>;

export interface IConfigurationFileStoreParseOptions extends IDataClassParseOptions {
    ignore_errors?: boolean;
}

export interface IConfigurationFileStoreStringifyOptions extends IDataClassStringifyOptions {}

export interface IConfigurationFileStoreOptions {
    parse?: IConfigurationFileStoreParseOptions;

    stringify?: IConfigurationFileStoreStringifyOptions;
}

export class Configuration extends DataClass {
    static file<B extends typeof Configuration, I extends Configuration = InstanceType<B>>(
        this: B,
        driver: IDriver,
        file_path: string,
        initial_value: I | null = null,
        options: IConfigurationFileStoreOptions = {}
    ): IConfigurationFileStore<I> {
        const {parse: parse_options = {}, stringify: stringify_options = {}} = options;

        const text_store = file_text(driver, file_path, null);

        const parsed_store = derived(text_store, ($text_store) => {
            if ($text_store) {
                try {
                    return this.parse($text_store, parse_options);
                } catch (err) {
                    if (!parse_options.ignore_errors) throw err;
                }
            }

            return initial_value;
        }) as Readable<I | null>;

        return {
            set: (value) => {
                const serialized = value ? this.stringify(value, stringify_options) : null;
                text_store.set(serialized);
            },

            subscribe: (subscriber) => {
                // NOTE: We're cloning here for each subscriber so we can maintain immutability
                return parsed_store.subscribe((value) => subscriber(value ? value.clone() : null));
            },

            update: (callback) => {
                const cache = get(parsed_store);
                const value = callback(cache);

                const serialized = value ? this.stringify(value, stringify_options) : null;
                text_store.set(serialized);
            },
        };
    }

    static async preload<B extends typeof Configuration, I extends Configuration = InstanceType<B>>(
        this: B,
        driver: IDriver,
        file_path: string,
        options: IConfigurationFileStoreOptions = {}
    ): Promise<IPreloadedConfigurationFileStore<I>> {
        const {parse: parse_options = {}} = options;

        // HACK: For this to work, the configuration must /NOT/ have required members

        let initial_value = new this();
        if (await driver.exists(file_path)) {
            try {
                initial_value = await this.read(driver, file_path, options);
            } catch (err) {
                if (!parse_options.ignore_errors) throw err;
            }
        }

        return this.file(
            driver,
            file_path,
            initial_value,
            options
        ) as IPreloadedConfigurationFileStore<I>;
    }

    static async read<B extends typeof Configuration, I = InstanceType<B>>(
        this: B,
        driver: IDriver,
        file_path: string,
        options: IDataClassParseOptions = {}
    ): Promise<I> | never {
        const buffer = await driver.read_file_text(file_path);
        const text = buffer.toString();

        return this.parse(text, options);
    }

    write(
        driver: IDriver,
        file_path: string,
        options?: IDataClassStringifyOptions
    ): Promise<void> | never {
        const text = this.stringify(options);

        return driver.write_file_text(file_path, text);
    }
}
