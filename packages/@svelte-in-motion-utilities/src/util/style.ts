import {format_camel_case} from "./string";

export function parse_style(text: string): Record<string, string> {
    const declarations: Record<string, string> = {};

    for (const declaration of text.split(";")) {
        const [property, value] = declaration.split(":");

        declarations[format_camel_case(property)] = value;
    }

    return declarations;
}
