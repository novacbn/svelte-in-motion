import type {IConfigurationRecord} from "./configuration";
import {configuration_reader} from "./configuration";

export interface IWorkspaceConfiguration extends IConfigurationRecord {
    framerate: number;

    height: number;

    maxframes: number;

    width: number;
}

export const CONFIGURATION_WORKSPACE = configuration_reader<IWorkspaceConfiguration>({
    type: "object",

    properties: {
        framerate: {
            type: "number",
            default: 60,

            maximum: 120,
            minimum: 16,
        },

        // NOTE: Not sure who would wait forever for an 8K render... Also
        // resolution is platform / codec dependant as well. But seems like a good default?

        height: {
            type: "number",
            default: 720,

            maximum: 4320,
            minimum: 0,
        },

        maxframes: {
            type: "number",
            default: 60 * 60,

            minimum: 0,
        },

        width: {
            type: "number",
            default: 1280,

            maximum: 7680,
            minimum: 0,
        },
    },
});
