/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
    interface Window {
        FFmpeg: typeof import("@ffmpeg/ffmpeg");
    }
}
