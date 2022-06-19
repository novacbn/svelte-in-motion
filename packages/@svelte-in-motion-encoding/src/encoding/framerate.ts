import type {ICodecNames} from "./codec";

export function get_available_framerate_range(codec: ICodecNames): [number, number] {
    // NOTE: Certain encoders or platforms might have limitations here that needs investigating

    // NOTE: There's a hard maximum of 120fps to support in-Browser previews

    return [0, 120];
}

export function get_default_framerate(codec: ICodecNames): number {
    return 60;
}
