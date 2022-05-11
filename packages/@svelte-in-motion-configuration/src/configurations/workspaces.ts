import type {IConfigurationRecord} from "./configuration";
import {configuration_reader} from "./configuration";

export interface IWorkspacesConfiguration extends IConfigurationRecord {
    name: string;

    identifier: string;

    last_accessed: null | string;

    storage: {
        driver: "indexeddb";

        configuration?: Record<string, boolean | number | null | string>;
    };
}

export const CONFIGURATION_WORKSPACES = configuration_reader<IWorkspacesConfiguration[]>({
    type: "array",

    items: {
        type: "object",
        required: ["identifier", "name"],

        properties: {
            name: {
                type: "string",
            },

            identifier: {
                type: "string",
            },

            last_accessed: {
                type: ["null", "string"],
                default: null,
            },

            storage: {
                type: "object",
                required: ["driver"],

                properties: {
                    driver: {
                        type: "string",

                        enum: ["indexeddb"],
                    },

                    configuration: {
                        type: "object",

                        additionalProperties: {
                            type: ["boolean", "null", "number", "string"],
                        },
                    },
                },
            },
        },
    },
});
