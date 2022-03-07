import {toPng} from "html-to-image";
import {pipeline_svelte} from "@novacbn/svelte-pipeline";
import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";
import {get} from "svelte/store";

import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    frame,
    framerate,
    idle,
    maxframes,
    playing,
} from "@svelte-in-motion/core";

import {dispatch} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import type {IJobEndMessage, IJobFrameMessage, IJobStartMessage} from "./lib/types/job";

import Sample from "./routes/_sample.svelte?raw";

const url = new URL(location.href);
const {end = "0", start = "0"} = Object.fromEntries(url.searchParams.entries());

const parsed_end = parseInt(end) || 0;
const parsed_start = parseInt(start) || 0;

if (parsed_end <= parsed_start) {
    throw new RangeError(
        `bad navigation to '/job.html' (parameter 'end' (${parsed_end}) is less than parameter 'start' (${parsed_start}))'`
    );
}

// TODO: validate `end` is within range of `maxframes`

const pipeline_store = pipeline_svelte({
    context: REPL_CONTEXT,
    imports: REPL_IMPORTS,

    compiler: {
        dev: true,
        generate: "dom",
        name: "App",
        filename: "App.svelte",
    },
});

const _frame = frame(parsed_start);
const _framerate = framerate(60);
const _maxframes = maxframes(Math.floor(60 * 4.5));
const _playing = playing(false);

const context = new Map<Symbol, any>([
    [CONTEXT_FRAME.symbol, _frame],
    [CONTEXT_FRAMERATE.symbol, _framerate],
    [CONTEXT_MAXFRAMES.symbol, _maxframes],
    [CONTEXT_PLAYING.symbol, _playing],
]);

const render_component = new PipelineRenderComponent({
    target: document.body,
    context,
    props: {
        class: "sim--job",
        pipeline: pipeline_store,
    },
});

render_component.$on("error", (event) => {
    throw event.detail.error;
});

render_component.$on("mount", () => {
    async function advance_frame() {
        await idle();

        const $frame = get(_frame);
        if ($frame > parsed_end) {
            dispatch<IJobEndMessage>("JOB_END", {});
            return;
        }

        const uri = await toPng(document.documentElement);

        dispatch<IJobFrameMessage>("JOB_FRAME", {
            frame: $frame,
            value: uri,
        });

        _frame.set($frame + 1);
        advance_frame();
    }

    advance_frame();
    dispatch<IJobStartMessage>("JOB_START", {});
});

pipeline_store.set(Sample);
