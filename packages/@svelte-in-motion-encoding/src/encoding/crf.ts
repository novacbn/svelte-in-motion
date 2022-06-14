import type {ICodecNames} from "./codec";

export function get_default_crf(codec: ICodecNames): number {
    switch (codec) {
        case "vp9":
            return 31;
    }

    throw new Error(`bad argument #0 to 'get_default_crf' (codec '${codec}' not supported)`);
}

export function get_supported_crf_range(codec: ICodecNames): [number, number] {
    // TODO: Investigate each codec's CRF range that ffmpeg supports

    return [0, 99];
}
