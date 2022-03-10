import {encodes} from "./encodes";
import {renders} from "./renders";

const MAX_FRAMES = 270;

window._testrun = async (WORKERS: number) => {
    console.log("STARTO");

    const PER_WORKER = Math.floor(MAX_FRAMES / WORKERS) + 1;

    console.log("RENDER STARTED");

    const frames = (
        await Promise.all(
            new Array(WORKERS).fill(null).map(async (value, index) => {
                const render_job = renders.queue({
                    file: "Sample.svelte",
                    start: PER_WORKER * index,
                    end: PER_WORKER * (index + 1) - 1,
                    width: 1920,
                    height: 1080,
                });

                return renders.yield(render_job);
            })
        )
    ).flat();

    console.log({frames: frames.length});
    console.log("RENDER ENDED");

    const encode_job = encodes.queue({
        codec: "vp9",
        crf: 0,
        framerate: 60,
        frames,
        height: 1080,
        pixel_format: "yuv420p",
        width: 1920,
    });

    console.log("ENCODING STARTED");

    const buffer = await encodes.yield(encode_job);

    console.log("ENCODING FINISHED");

    const blob = new Blob([buffer], {type: "video/webm"});
    const url = URL.createObjectURL(blob);

    window.open(url);

    console.log("ENDO");
};
