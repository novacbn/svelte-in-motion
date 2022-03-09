import type {FFmpeg} from "@ffmpeg/ffmpeg";
import {prefixStorage} from "unstorage";

import {STORAGE_FRAMES} from "../storage";

import {jobs} from "./jobs";

export enum RENDER_STATES {
    ended = "ended",

    paued = "paused",

    started = "started",

    uninitialized = "uninitialized",
}

export interface IRenderDimensions {
    width: number;

    height: number;
}

export interface IRenderEvent {
    render: IRender;
}

export interface IRender {
    identifier: string;

    state: `${RENDER_STATES}`;

    dimensions: IRenderDimensions;

    jobs: string[];
}

export interface IRenderVideoSettings {
    // NOTE: We're only going to support VP9/WebM for the forseeable future
    codec: "vp9";

    crf: number;

    pixel_format: "yuv420p" | "yuva420p";
}

export type IRenderQueueOptions = {
    file: string;

    workers?: number;
} & IRenderDimensions &
    Partial<IRenderVideoSettings>;

async function copy_frames(ffmpeg: FFmpeg, job: string): Promise<void> {
    const STORAGE_OUTPUT = prefixStorage(STORAGE_FRAMES, job);

    const frames = await STORAGE_OUTPUT.getKeys();

    await Promise.all(
        frames.map(async (name, index) => {
            const uri = (await STORAGE_OUTPUT.getItem(name)) as string;

            const response = await fetch(uri);
            const buffer = await response.arrayBuffer();
            const array = new Uint8Array(buffer);

            ffmpeg.FS("writeFile", `${index}.png`, array);
            console.log(`copied '${index}.png'`);

            await STORAGE_OUTPUT.removeItem(name);
        })
    );
}

async function render_video(
    ffmpeg: FFmpeg,
    framerate: number,
    codec: string,
    crf: number,
    pixel_format: string,
    width: number,
    height: number
): Promise<Uint8Array> {
    await ffmpeg.run(
        "-f",
        "image2",
        "-r",
        framerate.toString(),
        "-s",
        `${width}x${height}`,
        "-i",
        "%01d.png",
        "-vcodec",
        codec,
        "-crf",
        crf.toString(),
        "-pix_fmt",
        pixel_format,
        "output.webm"
    );

    return ffmpeg.FS("readFile", "output.webm");
}

function get_codec_argument(codec: IRenderVideoSettings["codec"]): string {
    switch (codec) {
        case "vp9":
            return "libvpx-vp9";
    }

    throw new TypeError(`bad argument #0 to 'get_codec_argument' (invalid codec '${codec}')`);
}

function RenderQueueOptions(options: IRenderQueueOptions): Required<IRenderQueueOptions> {
    const {
        codec = "vp9",
        crf = 0,
        file,
        height,
        pixel_format = "yuva420p",
        width,
        workers = 0,
    } = options;

    return {codec, crf, file, height, pixel_format, width, workers};
}

window._testrun = async () => {
    console.log("STARTO");

    const ffmpeg = window.FFmpeg.createFFmpeg() as FFmpeg;
    await ffmpeg.load();

    console.log("JOB STARTED");
    const identifier = jobs.queue({
        file: "Sample.svelte",
        start: 0,
        end: 270,
        width: 1920,
        height: 1080,
    });

    await new Promise<void>((resolve) => {
        const destroy = jobs.EVENT_END.subscribe((job) => {
            if (identifier === job.identifier) {
                resolve();
                destroy();
            }
        });
    });

    console.log("JOB ENDED");

    console.log("COPYING FRAMES");
    await copy_frames(ffmpeg, identifier);
    console.log("COPYING FINISHED");

    console.log("RENDERING VIDEO");
    const buffer = await render_video(ffmpeg, 60, "libvpx-vp9", 28, "yuv420p", 1920, 1080);
    console.log("RENDERING FINISHED");

    const blob = new Blob([buffer], {type: "video/webm"});
    const url = URL.createObjectURL(blob);

    window.open(url);

    // HACK: `ffmpeg.exit` throws errors on exiting to emulate process termination (?)
    try {
        ffmpeg.exit();
    } catch (err) {}

    console.log("ENDO");
};
