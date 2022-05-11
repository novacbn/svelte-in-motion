import {ext_pathname} from "@svelte-in-motion/utilities";

const MIMETYPE_UNKNOWN = "application/octet-stream";

const MIMETYPES_EXTENSIONS = {
    txt: "text/plain",

    css: "text/css",
    html: "text/html",
    js: "text/javascript",
    json: "application/json",
    ts: "text/typescript",

    flac: "audio/flac",
    mp3: "audio/mp3",
    ogg: "audio/ogg",

    apng: "image/apng",
    bmp: "image/bmp",
    gif: "image/gif",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xm",
    webp: "image/webp",

    mp4: "video/mp4",
    webm: "video/webm",
} as const;

const MIMETYPES_PLAINTEXT = [
    MIMETYPES_EXTENSIONS.css,
    MIMETYPES_EXTENSIONS.html,
    MIMETYPES_EXTENSIONS.js,
    MIMETYPES_EXTENSIONS.json,
    MIMETYPES_EXTENSIONS.ts,
    MIMETYPES_EXTENSIONS.txt,
] as const;

const LOOKUP_PLAINTEXT = new Set<string>(MIMETYPES_PLAINTEXT);

export type IMimetypes =
    | typeof MIMETYPES_EXTENSIONS[keyof typeof MIMETYPES_EXTENSIONS]
    | typeof MIMETYPE_UNKNOWN;

export type IPlainTextMimetypes = typeof MIMETYPES_PLAINTEXT[number];

export function get_mimetype(path: string): IMimetypes {
    const extension = ext_pathname(path);

    return (MIMETYPES_EXTENSIONS as any)[extension] ?? MIMETYPE_UNKNOWN;
}

export function is_plaintext(path: string): boolean {
    const mimetype = get_mimetype(path);

    return LOOKUP_PLAINTEXT.has(mimetype);
}
