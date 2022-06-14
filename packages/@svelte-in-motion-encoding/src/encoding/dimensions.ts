import type {ICodecNames} from "./codec";

export function get_available_dimensions_ranges(
    codec: ICodecNames
): [[number, number], [number, number]] {
    // NOTE: Depending on platform it might be wise to limit codecs to
    // specific diemensions. To account for OOM (out-of-memory) errors for instance

    return [
        [0, 4096],
        [0, 2160],
    ];
}

export function get_default_dimensions(codec: ICodecNames): [number, number] {
    return [1280, 720];
}
