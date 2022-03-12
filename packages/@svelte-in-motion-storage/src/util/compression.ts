import {compress as compress_lzutf8, decompress as decompress_lzutf8} from "lzutf8";

export function compress(buffer: Uint8Array): Uint8Array {
    return compress_lzutf8(buffer, {
        inputEncoding: "ByteArray",
        outputEncoding: "ByteArray",
    });
}

export function decompress(buffer: Uint8Array): Uint8Array {
    return decompress_lzutf8(buffer, {
        inputEncoding: "ByteArray",
        outputEncoding: "ByteArray",
    });
}
