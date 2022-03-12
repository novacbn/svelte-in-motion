export function decode_text(buffer: Uint8Array): string {
    const decoder = new TextDecoder();

    return decoder.decode(buffer);
}

export function encode_text(text: string): Uint8Array {
    const encoder = new TextEncoder();

    return encoder.encode(text);
}
