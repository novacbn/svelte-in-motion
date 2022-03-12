import {toPng} from "html-to-image";
import {pipeline_svelte} from "@novacbn/svelte-pipeline";
import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";
import {get} from "svelte/store";

import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    clamp,
    frame,
    framerate,
    idle,
    maxframes,
    playing,
} from "@svelte-in-motion/core";
import {parse_configuration} from "@svelte-in-motion/metadata";

import {dispatch} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import {STORAGE_USER} from "./lib/storage";

import type {
    IRenderEndMessage,
    IRenderProgressMessage,
    IRenderStartMessage,
} from "./lib/types/render";

(async () => {
    const url = new URL(location.href);
    const {
        file,
        identifier,
        end = "0",
        start = "0",
    } = Object.fromEntries(url.searchParams.entries());

    if (!identifier) {
        throw new ReferenceError("bad navigation to '/render.html' (no identifier specified)");
    }

    if (!file) {
        throw new ReferenceError("bad navigation to '/render.html' (no file specified)");
    }

    if (!(await STORAGE_USER.exists(file))) {
        throw new ReferenceError(`bad navigation to '/render.html' (file '${file}' is invalid)`);
    }

    const SCRIPT = (await STORAGE_USER.read_file_text(file)) as string;
    const CONFIGURATION = parse_configuration(SCRIPT);

    const parsed_end = clamp(parseInt(end) || 0, 0, CONFIGURATION.maxframes);
    const parsed_start = Math.max(parseInt(start) || 1, 0);

    const total_frames = parsed_end - parsed_start;

    if (parsed_end <= parsed_start) {
        throw new RangeError(
            `bad navigation to '/render.html' (parameter 'end' (${parsed_end}) is less than parameter 'start' (${parsed_start}))'`
        );
    }

    const FRAMES: Record<number, string> = {};

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
            class: "sim--render",
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
                dispatch<IRenderEndMessage>("RENDER_END", {
                    frames: Object.values(FRAMES),
                });

                return;
            }

            FRAMES[$frame] = await toPng(document.documentElement);

            dispatch<IRenderProgressMessage>("RENDER_PROGRESS", {
                progress: ($frame - parsed_start) / total_frames,
            });

            _frame.set($frame + 1);
            advance_frame();
        }

        advance_frame();
        dispatch<IRenderStartMessage>("RENDER_START", {});
    });

    pipeline_store.set(SCRIPT);
})();
