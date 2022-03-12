import {pipeline_svelte} from "@novacbn/svelte-pipeline";
import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";
import {get} from "svelte/store";

import {bundle} from "@svelte-in-motion/bundling";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    debounce,
    frame as frame_store,
    framerate as framerate_store,
    maxframes as maxframes_store,
    playing as playing_store,
} from "@svelte-in-motion/core";
import {parse_configuration} from "@svelte-in-motion/metadata";

import {dispatch, subscribe} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import {STORAGE_USER} from "./lib/storage";

import {preload_file} from "./lib/stores/file";

import type {
    IPreviewDestroyMessage,
    IPreviewErrorMessage,
    IPreviewFrameMessage,
    IPreviewPlayingMessage,
    IPreviewMountMessage,
    IPreviewReadyMessage,
} from "./lib/types/preview";

(async () => {
    const url = new URL(location.href);
    const {file} = Object.fromEntries(url.searchParams.entries());

    if (!file) {
        throw new ReferenceError("bad navigation to '/preview.html' (no file specified)");
    }

    if (!(await STORAGE_USER.exists(file))) {
        throw new ReferenceError(`bad navigation to '/preview.html' (file '${file}' is invalid)`);
    }

    const _file = await preload_file(file);

    const testscript = await bundle({
        file,
        storage: STORAGE_USER,
    });

    console.log(testscript);

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

        dispatch<IPreviewErrorMessage>("PREVIEW_ERROR", {
            name,
            message,
            stack,
        });
    });

    render_component.$on("destroy", () => {
        dispatch<IPreviewDestroyMessage>("PREVIEW_DESTROY", {});
    });

    render_component.$on("mount", () => {
        dispatch<IPreviewMountMessage>("PREVIEW_MOUNT", {});
    });

    subscribe<IPreviewFrameMessage>("PREVIEW_FRAME", ({frame}) => _frame.set(frame));
    subscribe<IPreviewPlayingMessage>("PREVIEW_PLAYING", ({playing}) => _playing.set(playing));

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

    dispatch<IPreviewReadyMessage>("PREVIEW_READY", {});
})();
