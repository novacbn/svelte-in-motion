import {parse} from "jsonc-parser";
import type {Schema} from "@exodus/schemasafe";
import {validator} from "@exodus/schemasafe";

import type {IDriver} from "@svelte-in-motion/storage";

import {file_configuration, IFileConfigurationStore, preload_configuration} from "../stores/file";

export type IConfigurationArray = IConfigurationValue[];

export type IConfigurationRecord = {[key: string]: IConfigurationValue};

export type IConfigurationValue =
    | boolean
    | null
    | number
    | string
    | IConfigurationArray
    | IConfigurationRecord;

export interface IConfigurationReader<T extends IConfigurationArray | IConfigurationRecord> {
    parse(text: string): T | never;

    read(driver: IDriver, file_path: string): Promise<T> | never;

    stringify(value: T): string | never;

    validate(value?: any): T | never;

    watch(driver: IDriver, file_path: string, debounce?: number): IFileConfigurationStore<T>;

    watch_preload(
        driver: IDriver,
        file_path: string,
        debounce?: number
    ): Promise<IFileConfigurationStore<T>>;

    write(driver: IDriver, file_path: string, value: T): Promise<void> | never;
}

export function configuration_reader<T extends IConfigurationArray | IConfigurationRecord>(
    schema: Exclude<Schema, boolean>
): IConfigurationReader<T> {
    const default_value = schema.type === "array" ? [] : {};

    const validate = validator(
        {
            $schema: "https://json-schema.org/draft/2019-09/schema",
            ...schema,
        },
        {
            allErrors: true,
            includeErrors: true,

            useDefaults: true,

            // Strong Mode: https://github.com/ExodusMovement/schemasafe/blob/master/doc/Strong-mode.md

            requireSchema: true,
            //requireValidation: true,
            //requireStringValidation: true,
            complexityChecks: true,

            forbidNoopValues: true,
            weakFormats: false,

            allowUnusedKeywords: false,
            allowUnreachable: false,
            $schemaDefault: null,
        }
    );

    return {
        parse(text) {
            return this.validate(parse(text));
        },

        async read(driver, file_path) {
            const text = await driver.read_file_text(file_path);

            return this.parse(text);
        },

        stringify(value) {
            value = this.validate(value);

            return JSON.stringify(value, null, 4);
        },

        validate(value): T | never {
            const is_valid = validate(value === undefined ? structuredClone(default_value) : value);

            if (!is_valid) {
                const errors = validate.errors!.reduce<string[]>((accum, error) => {
                    accum.push(`${error.instanceLocation}`);

                    return accum;
                }, []);

                throw new TypeError(
                    "bad argument #0 to 'configuration_reader.validate' (following properties failed to validate):\n" +
                        errors
                );
            }

            return value;
        },

        watch(driver, file_path, debounce?) {
            return file_configuration<T>(
                driver,
                this,
                file_path,
                debounce
            ) as IFileConfigurationStore<T>;
        },

        watch_preload(driver, file_path, debounce?) {
            return preload_configuration<T>(driver, this, file_path, debounce) as Promise<
                IFileConfigurationStore<T>
            >;
        },

        async write(driver, file_path, value) {
            const text = this.stringify(value);

            return driver.write_file_text(file_path, text);
        },
    };
}
