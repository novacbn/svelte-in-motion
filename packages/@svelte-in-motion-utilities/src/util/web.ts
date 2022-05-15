import {format_camel_case} from "./string";

export function download_blob(blob: Blob, file_name: string): void {
    const url = URL.createObjectURL(blob);
    const anchor_element = document.createElement("A");

    anchor_element.setAttribute("download", file_name);
    anchor_element.setAttribute("href", url);

    anchor_element.click();

    URL.revokeObjectURL(url);
    anchor_element.remove();
}

export function download_buffer(buffer: Uint8Array, file_name: string, mimetype: string): void {
    const blob = new Blob([buffer], {type: mimetype});

    download_blob(blob, file_name);
}

export function parse_style(text: string): Record<string, string> {
    const declarations: Record<string, string> = {};
    const tokens = text.split(";").filter((token) => !!token);

    for (const declaration of tokens) {
        const [property, value] = declaration.split(":");

        declarations[format_camel_case(property)] = value;
    }

    return declarations;
}
