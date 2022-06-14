import type {ICodecNames} from "./codec";

export function get_supported_framerate_range(
    codec: ICodecNames,
    width: number,
    height: number
): [number, number] {
    // NOTE: Certain encoders or platforms might have limitations here that needs investigating

    // NOTE: There's a hard maximum of 120fps to support in-Browser previews

    return [0, 120];
}
