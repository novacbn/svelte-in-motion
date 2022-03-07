import {pipeline_svelte} from "@novacbn/svelte-pipeline";
import {PipelineRenderComponent} from "@novacbn/svelte-pipeline/components";

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

import {dispatch, subscribe} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import type {
    IRenderDestroyMessage,
    IRenderErrorMessage,
    IRenderFrameMessage,
    IRenderFramerateMessage,
    IRenderMaxFramesMessage,
    IRenderPlayingMessage,
    IRenderMountMessage,
    IRenderScriptMessage,
    IRenderReadyMessage,
} from "./lib/types/render";

const url = new URL(location.href);
const {
    frame = "0",
    framerate = "0",
    maxframes = "0",
    playing = "false",
} = Object.fromEntries(url.searchParams.entries());

const parsed_frame = parseInt(frame) || 0;
const parsed_framerate = parseInt(framerate) || 0;
const parsed_maxframes = parseInt(maxframes) || 0;

const parsed_playing = playing.toLowerCase() === "true";

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

const _frame = frame_store(parsed_frame);
const _framerate = framerate_store(parsed_framerate);
const _maxframes = maxframes_store(parsed_maxframes);

const _playing = playing_store(parsed_playing);

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
subscribe<IRenderFramerateMessage>("RENDER_FRAMERATE", ({framerate}) => _framerate.set(framerate));
subscribe<IRenderMaxFramesMessage>("RENDER_MAXFRAMES", ({maxframes}) => _maxframes.set(maxframes));
subscribe<IRenderPlayingMessage>("RENDER_PLAYING", ({playing}) => _playing.set(playing));
subscribe<IRenderScriptMessage>("RENDER_SCRIPT", ({script}) => pipeline_store.set(script));

_frame.subscribe((frame) => dispatch<IRenderFrameMessage>("RENDER_FRAME", {frame}));

// HACK: Need to subscribe to it, so it'll run
_advance.subscribe(() => {});

dispatch<IRenderReadyMessage>("RENDER_READY", {});
