import {format_camel_case} from "./string";

export function parse_style(text: string): Record<string, string> {
    const declarations: Record<string, string> = {};
    const tokens = text.split(";").filter((token) => !!token);

    for (const declaration of tokens) {
        const [property, value] = declaration.split(":");

        declarations[format_camel_case(property)] = value;
    }

    return declarations;
}
