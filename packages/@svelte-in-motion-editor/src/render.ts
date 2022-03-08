import {pipeline_svelte} from "@novacbn/svelte-pipeline";
import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";
import {get} from "svelte/store";

import {debounce} from "@svelte-in-motion/animations";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    advance,
    frame as frame_store,
    framerate as framerate_store,
    maxframes as maxframes_store,
    playing as playing_store,
} from "@svelte-in-motion/core";
import {parse_configuration} from "@svelte-in-motion/metadata";

import {dispatch, subscribe} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import type {
    IRenderDestroyMessage,
    IRenderErrorMessage,
    IRenderFrameMessage,
    IRenderPlayingMessage,
    IRenderMountMessage,
    IRenderReadyMessage,
} from "./lib/types/render";
import {STORAGE_USER} from "./lib/storage";
import {preload_file} from "./lib/stores/file";

(async () => {
    const url = new URL(location.href);
    const {file} = Object.fromEntries(url.searchParams.entries());

    if (!file) {
        throw new ReferenceError("bad navigation to '/render.html' (no file specified)");
    }

    if (!(await STORAGE_USER.hasItem(file))) {
        throw new ReferenceError(`bad navigation to '/render.html' (file '${file}' is invalid)`);
    }

    const _file = await preload_file(file);

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

    const _frame = frame_store();
    const _framerate = framerate_store();
    const _maxframes = maxframes_store();

    const _playing = playing_store();
    const _advance = advance(_frame, _framerate, _maxframes, _playing);

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
        const {message, name, stack} = event.detail.error;

        dispatch<IRenderErrorMessage>("RENDER_ERROR", {
            name,
            message,
            stack,
        });
    });

    render_component.$on("destroy", () => {
        dispatch<IRenderDestroyMessage>("RENDER_DESTROY", {});
    });

    render_component.$on("mount", () => {
        dispatch<IRenderMountMessage>("RENDER_MOUNT", {});
    });

    subscribe<IRenderFrameMessage>("RENDER_FRAME", ({frame}) => _frame.set(frame));
    subscribe<IRenderPlayingMessage>("RENDER_PLAYING", ({playing}) => _playing.set(playing));

    _frame.subscribe((frame) => dispatch<IRenderFrameMessage>("RENDER_FRAME", {frame}));
    _playing.subscribe((playing) => dispatch<IRenderPlayingMessage>("RENDER_PLAYING", {playing}));

    // HACK: Need to subscribe to it, so it'll run
    _advance.subscribe(() => {});

    _file.subscribe(
        debounce(async (text) => {
            // TODO: handle if file gets removed
            const CONFIGURATION = parse_configuration(text);

            _framerate.set(CONFIGURATION.framerate);
            _maxframes.set(CONFIGURATION.maxframes);

            const frame = get(_frame);

            _frame.set(Math.min(frame, CONFIGURATION.maxframes));
            pipeline_store.set(text);
        }, 100)
    );

    dispatch<IRenderReadyMessage>("RENDER_READY", {});
})();
