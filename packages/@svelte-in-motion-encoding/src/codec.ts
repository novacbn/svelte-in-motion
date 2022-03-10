import {IS_BROWSER} from "@svelte-in-motion/core";

export enum SUPPORTED_CODECS {
    vp9 = "libvpx-vp9",
}

export type ICodecNames = keyof typeof SUPPORTED_CODECS;

export type ICodecEncoders = `${SUPPORTED_CODECS}`;

export function get_available_codecs(): ICodecNames[] {
    if (IS_BROWSER) {
        return ["vp9"];
    }

    throw new Error("bad dispatch to 'get_available_codecs' (platform not supported)");
}

export function get_default_codec(): ICodecNames {
    if (IS_BROWSER) return "vp9";

    throw new Error("bad dispatch to 'get_default_codec' (platform not supported)");
}

export function get_codec(codec: ICodecNames): ICodecEncoders {
    switch (codec) {
        case "vp9":
            return SUPPORTED_CODECS.vp9;
    }

    throw new Error(`bad argument #0 to 'get_codec' (codec '${codec}' not supported)`);
}

export function get_codec_arguments(codec: ICodecNames): string[] {
    switch (codec) {
        case "vp9":
            return ["-row-mt", "1"];
    }

    throw new Error(`bad argument #0 to 'get_codec_argument' (codec '${codec}' not supported)`);
}

export function get_codec_extension(codec: ICodecNames): string {
    switch (codec) {
        case "vp9":
            return "webm";
    }

    throw new Error(`bad argument #0 to 'get_codec_extension' (codec '${codec}' not supported)`);
}
