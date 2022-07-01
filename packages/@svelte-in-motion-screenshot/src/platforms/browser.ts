import {toPng} from "html-to-image";

export async function screenshot_node(element: HTMLElement): Promise<Uint8Array> {
    const datauri = await toPng(element);

    const response = await fetch(datauri);
    const buffer = await response.arrayBuffer();

    return new Uint8Array(buffer);
}
