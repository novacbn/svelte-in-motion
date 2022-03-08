import type {Schema} from "@cfworker/json-schema";
import {validate_configuration} from ".";
import {collect_metadata, parse_ast} from "./parse";

export interface IConfiguration {
    framerate: number;

    maxframes: number;
}

const SCHEMA_CONFIGURATION: Schema = {
    type: "object",
    required: ["framerate", "maxframes"],

    properties: {
        framerate: {
            type: "number",
            maximum: 120,
            minimum: 16,
        },

        maxframes: {
            type: "number",
            minimum: 0,
        },
    },
};

export function parse_configuration(source: string): IConfiguration {
    const ast = parse_ast(source);
    const metadata = collect_metadata(ast, "CONFIGURATION");

    if (!validate_configuration<IConfiguration>(metadata, SCHEMA_CONFIGURATION)) {
        throw new SyntaxError("bad argument #0 to 'parse_configuration' (invalid value)");
    }

    return metadata;
}
