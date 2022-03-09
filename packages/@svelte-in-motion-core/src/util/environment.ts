export const IS_BROWSER: boolean = typeof window === "object";

// TODO: This can pick up false positives due to various build tools polyfilling, maybe a feature flag during build
export const IS_NODE: boolean = typeof process === "object";

// TODO: Figure out how to have this detection work, maybe a feature flag during build
export const IS_TAURI: boolean = false;
