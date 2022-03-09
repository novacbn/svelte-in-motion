import {toPng} from "html-to-image";
import {pipeline_svelte} from "@novacbn/svelte-pipeline";
import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";
import {get} from "svelte/store";
import {prefixStorage} from "unstorage";

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
import {parse_configuration} from "@svelte-in-motion/metadata";

import {dispatch} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import type {IJobEndMessage, IJobFrameMessage, IJobStartMessage} from "./lib/types/job";
import {STORAGE_USER, STORAGE_FRAMES} from "./lib/storage";

(async () => {
    const url = new URL(location.href);
    const {file, job, end = "0", start = "0"} = Object.fromEntries(url.searchParams.entries());

    if (!job) {
        throw new ReferenceError("bad navigation to '/job.html' (no job specified)");
    }

    if (!file) {
        throw new ReferenceError("bad navigation to '/job.html' (no file specified)");
    }

    if (!(await STORAGE_USER.hasItem(file))) {
        throw new ReferenceError(`bad navigation to '/job.html' (file '${file}' is invalid)`);
    }

    const SCRIPT = (await STORAGE_USER.getItem(file)) as string;
    const CONFIGURATION = parse_configuration(SCRIPT);
    const STORAGE_OUTPUT = prefixStorage(STORAGE_FRAMES, job);

    const parsed_end = Math.min(parseInt(end) || CONFIGURATION.maxframes, CONFIGURATION.maxframes);
    const parsed_start = parseInt(start) || 1;

    if (parsed_end <= parsed_start) {
        throw new RangeError(
            `bad navigation to '/job.html' (parameter 'end' (${parsed_end}) is less than parameter 'start' (${parsed_start}))'`
        );
    }

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
    const _framerate = framerate(CONFIGURATION.framerate);
    const _maxframes = maxframes(CONFIGURATION.maxframes);
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
                const frames = (await Promise.all(
                    new Array(parsed_end)
                        .fill(null)
                        .map((value, index) => STORAGE_OUTPUT.getItem(`${index + 1}.png.datauri`))
                )) as string[];

                dispatch<IJobEndMessage>("JOB_END", {
                    frames,
                });

                return;
            }

            const uri = await toPng(document.documentElement);
            await STORAGE_OUTPUT.setItem(`${$frame}.png.datauri`, uri);

            dispatch<IJobFrameMessage>("JOB_FRAME", {
                frame: $frame,
            });

            _frame.set($frame + 1);
            advance_frame();
        }

        advance_frame();
        dispatch<IJobStartMessage>("JOB_START", {});
    });

    pipeline_store.set(SCRIPT);
})();
