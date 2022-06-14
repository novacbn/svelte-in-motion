import type {ICodecNames} from "./codec";

export enum SUPPORTED_PIXEL_FORMATS {
    yuv420p = "yuv420p",
}

export type IPixelFormatNames = keyof typeof SUPPORTED_PIXEL_FORMATS;

export type IPixelFormatFormats = `${SUPPORTED_PIXEL_FORMATS}`;

export function get_available_pixel_formats(codec: ICodecNames): IPixelFormatNames[] {
    // NOTE: This might also change based on if in Browser, depending on compatibility

    switch (codec) {
        case "vp9":
            return ["yuv420p"];
    }

    throw new Error(
        `bad argument #0 to 'get_available_pixel_formats' (codec '${codec}' not supported)`
    );
}

export function get_default_pixel_format(codec: ICodecNames): IPixelFormatNames {
    switch (codec) {
        case "vp9":
            return "yuv420p";
    }

    throw new Error(
        `bad argument #0 to 'get_default_pixel_formats' (codec '${codec}' not supported)`
    );
}

export function get_pixel_format(name: IPixelFormatNames): IPixelFormatFormats {
    switch (name) {
        case "yuv420p":
            return "yuv420p";
    }

    throw new Error(`bad argument #0 to 'get_pixel_format' (pixel format '${name}' not supported)`);
}
