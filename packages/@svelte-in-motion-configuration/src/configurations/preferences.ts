import type {IConfigurationRecord} from "./configuration";
import {configuration_reader} from "./configuration";

export interface IPreferencesConfiguration extends IConfigurationRecord {
    ui: {
        editor: {
            script: {
                enabled: boolean;
            };
        };

        preview: {
            checkerboard: {
                enabled: boolean;
            };

            viewport: {
                enabled: boolean;
            };
        };

        zen_mode: {
            enabled: boolean;
        };
    };
}

export const CONFIGURATION_PREFERENCES = configuration_reader<IPreferencesConfiguration>({
    type: "object",

    properties: {
        editor: {
            type: "object",

            properties: {
                script: {
                    type: "object",

                    properties: {
                        enabled: {
                            type: "boolean",
                            default: true,
                        },
                    },
                },
            },
        },

        preview: {
            type: "object",

            properties: {
                checkerboard: {
                    type: "object",

                    properties: {
                        enabled: {
                            type: "boolean",
                            default: true,
                        },
                    },
                },

                viewport: {
                    type: "object",

                    properties: {
                        enabled: {
                            type: "boolean",
                            default: true,
                        },
                    },
                },
            },
        },

        zen_mode: {
            type: "object",

            properties: {
                enabled: {
                    type: "boolean",
                    default: false,
                },
            },
        },
    },
});
