import type {SvelteComponent} from "svelte";
import {get} from "svelte/store";

import {bundle} from "@svelte-in-motion/bundling";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    evaluate_code,
    frame as frame_store,
    framerate as framerate_store,
    generate_id,
    maxframes as maxframes_store,
    normalize_pathname,
    playing as playing_store,
} from "@svelte-in-motion/core";
import type {IConfiguration} from "@svelte-in-motion/metadata";

import {dispatch, subscribe} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import {STORAGE_USER} from "./lib/storage";

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

    const _frame = frame_store();
    const _framerate = framerate_store();
    const _maxframes = maxframes_store();

    const _playing = playing_store();

    let _dependencies: Set<string> = new Set();

    let _component: SvelteComponent | null = null;
    let _nonce: string;

    async function update(): Promise<void> {
        const nonce = (_nonce = generate_id());

        const result = await bundle({
            file,
            storage: STORAGE_USER,
        });

        if (_nonce !== nonce) return;

        if ("errors" in result) {
            const [first_error] = result.errors;

            dispatch<IPreviewErrorMessage>("PREVIEW_ERROR", {
                message: first_error.message,
                name: first_error.name,
            });

            return;
        }

        _dependencies = new Set(
            result.dependencies.map((file_path) => normalize_pathname(file_path))
        );

        const module = evaluate_code<typeof SvelteComponent, {CONFIGURATION: IConfiguration}>(
            result.script,
            REPL_CONTEXT,
            REPL_IMPORTS
        );

        const {default: Component} = module;
        const {CONFIGURATION} = module.exports;

        _framerate.set(CONFIGURATION.framerate);
        _maxframes.set(CONFIGURATION.maxframes);

        const frame = get(_frame);

        _frame.set(Math.min(frame, CONFIGURATION.maxframes));

        if (_component) {
            _component.$destroy();
            _component = null;

            dispatch<IPreviewDestroyMessage>("PREVIEW_DESTROY", {});
        }

        _component = new Component({
            target: document.body,
            context: new Map<Symbol, any>([
                [CONTEXT_FRAME.symbol, _frame],
                [CONTEXT_FRAMERATE.symbol, _framerate],
                [CONTEXT_MAXFRAMES.symbol, _maxframes],
                [CONTEXT_PLAYING.symbol, _playing],
            ]),
        });

        dispatch<IPreviewMountMessage>("PREVIEW_MOUNT", {});
    }

    window.addEventListener("error", (event) => {
        const error = event.error as Error;

        dispatch<IPreviewErrorMessage>("PREVIEW_ERROR", {
            message: error.message,
            name: error.name,
        });
    });

    subscribe<IPreviewFrameMessage>("PREVIEW_FRAME", ({frame}) => _frame.set(frame));
    subscribe<IPreviewPlayingMessage>("PREVIEW_PLAYING", ({playing}) => _playing.set(playing));

    STORAGE_USER.watch_directory("/", {
        exclude_directories: true,

        on_watch(event) {
            if (_dependencies.has(event.path)) update();
        },
    });

    update();

    dispatch<IPreviewReadyMessage>("PREVIEW_READY", {});
})();
