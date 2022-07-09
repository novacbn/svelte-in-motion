const SUPPORTED_EXTENSIONS = [".svelte"];

export function can_preview_file(file_path: string): boolean {
    file_path = file_path.toLowerCase();

    for (const extension of SUPPORTED_EXTENSIONS) if (file_path.endsWith(extension)) return true;
    return false;
}
