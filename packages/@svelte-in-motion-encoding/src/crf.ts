import type {ICodecNames} from "./codec";

export function get_default_crf(codec: ICodecNames): number {
    switch (codec) {
        case "vp9":
            return 0;
    }

    throw new Error(`bad argument #0 to 'get_default_crf' (codec '${codec}' not supported)`);
}
