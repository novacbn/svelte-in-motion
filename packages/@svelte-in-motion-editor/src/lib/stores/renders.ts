import {prefixStorage} from "unstorage";

import {encode} from "@svelte-in-motion/encoding";

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

    console.log("COLLECTING FRAMES");

    const STORAGE_OUTPUT = prefixStorage(STORAGE_FRAMES, identifier);
    const frames = await STORAGE_OUTPUT.getKeys();

    const buffers = await Promise.all(
        frames.map(async (name, index) => {
            const uri = (await STORAGE_OUTPUT.getItem(name)) as string;
            await STORAGE_OUTPUT.removeItem(name);

            const response = await fetch(uri);
            const buffer = await response.arrayBuffer();

            console.log(`copied '${index}.png'`);
            return new Uint8Array(buffer);
        })
    );

    console.log("COLLECTING FINISHED");

    console.log("RENDERING VIDEO");

    const handle = encode({
        codec: "vp9",
        crf: 0,
        framerate: 60,
        frames: buffers,
        height: 1080,
        pixel_format: "yuv420p",
        width: 1920,
    });

    let buffer;
    try {
        buffer = await handle.result;
    } catch (err) {
        document.body.remove();
        throw err;
    }
    console.log("RENDERING FINISHED");

    const blob = new Blob([buffer], {type: "video/webm"});
    const url = URL.createObjectURL(blob);

    window.open(url);

    console.log("ENDO");
};
