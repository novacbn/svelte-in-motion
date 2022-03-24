import {toPng} from "html-to-image";
import type {SvelteComponent} from "svelte";
import {tick} from "svelte";

import {bundle} from "@svelte-in-motion/bundling";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    clamp,
    evaluate_code,
    frame as frame_store,
    framerate as framerate_store,
    maxframes as maxframes_store,
    playing as playing_store,
} from "@svelte-in-motion/core";
import type {IConfiguration} from "@svelte-in-motion/metadata";

import {dispatch} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import {STORAGE_USER} from "./lib/storage";

import type {
    IRenderEndMessage,
    IRenderErrorMessage,
    IRenderProgressMessage,
    IRenderStartMessage,
} from "./lib/types/render";

(async () => {
    const url = new URL(location.href);
    const {file, end = "0", start = "0"} = Object.fromEntries(url.searchParams.entries());

    if (!file) {
        throw new ReferenceError("bad navigation to '/render.html' (no file specified)");
    }

    if (!(await STORAGE_USER.exists(file))) {
        throw new ReferenceError(`bad navigation to '/render.html' (file '${file}' is invalid)`);
    }

    window.addEventListener("error", (event) => {
        const {message, name, stack} = event.error;

        dispatch<IRenderErrorMessage>("RENDER_ERROR", {
            name,
            message,
            stack,
        });
    });

    const [bundled_script] = await bundle({
        file,
        storage: STORAGE_USER,
    });

    const module = evaluate_code<typeof SvelteComponent, {CONFIGURATION: IConfiguration}>(
        bundled_script,
        REPL_CONTEXT,
        REPL_IMPORTS
    );

    const {default: Component} = module;
    const {CONFIGURATION} = module.exports;

    const parsed_end = clamp(parseInt(end) || 0, 0, CONFIGURATION.maxframes);
    const parsed_start = Math.max(parseInt(start) || 0, 0);

    const total_frames = parsed_end - parsed_start;

    if (parsed_end < parsed_start) {
        throw new RangeError(
            `bad navigation to '/render.html' (parameter 'end' (${parsed_end}) is less than parameter 'start' (${parsed_start})'`
        );
    }

    const _frame = frame_store(parsed_start);
    const _framerate = framerate_store(CONFIGURATION.framerate);
    const _maxframes = maxframes_store(CONFIGURATION.maxframes);

    const _playing = playing_store();

    const FRAMES: Record<number, string> = {};

    const CONTEXT = new Map<Symbol, any>([
        [CONTEXT_FRAME.symbol, _frame],
        [CONTEXT_FRAMERATE.symbol, _framerate],
        [CONTEXT_MAXFRAMES.symbol, _maxframes],

        [CONTEXT_PLAYING.symbol, _playing],
    ]);

    new Component({
        target: document.body,
        context: CONTEXT,
    });

    dispatch<IRenderStartMessage>("RENDER_START", {});

    for (let frame = parsed_start; frame <= parsed_end; frame++) {
        _frame.set(frame);
        await tick();

        FRAMES[frame] = await toPng(document.documentElement);

        dispatch<IRenderProgressMessage>("RENDER_PROGRESS", {
            progress: (frame - parsed_start) / total_frames,
        });
    }

    dispatch<IRenderEndMessage>("RENDER_END", {
        frames: Object.values(FRAMES),
    });
})();
