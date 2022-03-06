export const DEFAULT_ORIGIN: string = "http://svelte-in-motion.invalid";

function split_pathname(pathname: string): string[] {
    return pathname.split("/").filter((segment) => segment.length > 0);
}

export function append_pathname(uri: string, path: string): string {
    path = normalize_pathname(path);
    if (!uri) return path;

    let {hash, pathname, origin, search} = new URL(uri, DEFAULT_ORIGIN);

    pathname = pathname.endsWith("/") ? pathname.slice(0, -1) + path : pathname + path;
    origin = origin === DEFAULT_ORIGIN ? "" : origin;

    return origin + pathname + search + hash;
}

export function base_pathname(uri: string): string {
    const pathname = normalize_pathname(uri);
    const segments = split_pathname(pathname);

    return "/" + segments[segments.length - 1];
}

export function dir_pathname(uri: string): string {
    const pathname = normalize_pathname(uri);
    const segments = split_pathname(pathname);

    return "/" + segments.slice(0, -1).join("/");
}

export function ext_pathname(uri: string): string {
    const pathname = normalize_pathname(uri);
    const segments = pathname.split(".");

    if (segments.length < 2) return "";
    return "." + segments[segments.length - 1];
}

export function is_absolute_pathname(pathname: string): boolean {
    return !is_relative_pathname(pathname);
}

export function is_external_url(uri: string): boolean {
    return !is_internal_url(uri);
}

export function is_internal_url(uri: string): boolean {
    let url: URL;
    try {
        url = new URL(uri, DEFAULT_ORIGIN);
    } catch (err) {
        return false;
    }

    return url.origin === DEFAULT_ORIGIN;
}

export function is_relative_pathname(pathname: string): boolean {
    return pathname.startsWith("./") || pathname.startsWith("../");
}

export function normalize_origin(uri: string): string {
    const {origin} = new URL(uri);

    return origin;
}

export function normalize_pathname(uri: string): string {
    const {pathname} = new URL(uri, DEFAULT_ORIGIN);

    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function normalize_relative(uri: string): string {
    const {hash, pathname, search} = new URL(uri, DEFAULT_ORIGIN);

    return pathname + search + hash;
}
