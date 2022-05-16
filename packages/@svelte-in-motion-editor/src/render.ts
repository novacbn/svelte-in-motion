import {toPng} from "html-to-image";
import type {SvelteComponent} from "svelte";
import {tick} from "svelte";

import {bundle} from "@svelte-in-motion/bundling";
import {CONFIGURATION_WORKSPACE, CONFIGURATION_WORKSPACES} from "@svelte-in-motion/configuration";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    frame as make_frame_store,
    framerate as make_framerate_store,
    maxframes as make_maxframes_store,
    playing as make_playing_store,
} from "@svelte-in-motion/core";
import {clamp, evaluate_code} from "@svelte-in-motion/utilities";

import {dispatch} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import {
    FILE_CONFIGURATION_WORKSPACE,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
    make_driver,
} from "./lib/storage";

import type {
    IRenderEndMessage,
    IRenderErrorMessage,
    IRenderProgressMessage,
    IRenderStartMessage,
} from "./lib/types/render";

(async () => {
    const url = new URL(location.href);
    const {
        file,
        end = "0",
        start = "0",
        workspace: workspace_identifier,
    } = Object.fromEntries(url.searchParams.entries());

    if (!workspace_identifier) {
        throw new ReferenceError(
            "bad query parameter '?workspace' to '/render.html' (no workspace specified)"
        );
    }

    const workspaces = await CONFIGURATION_WORKSPACES.read(
        STORAGE_USER,
        FILE_CONFIGURATION_WORKSPACES
    );

    const workspace = workspaces.find((workspace) => workspace.identifier === workspace_identifier);

    if (!workspace) {
        throw new ReferenceError(
            `bad query parameter '?workspace' to '/render.html' (workspace '${workspace_identifier}' is not valid)`
        );
    }

    const storage = make_driver(workspace);

    if (!file) {
        throw new ReferenceError(
            "bad query parameter '?file' to '/render.html' (no file specified)"
        );
    }

    if (!(await storage.exists(file))) {
        throw new ReferenceError(
            `bad query parameter '?file' to '/render.html' (file '${file}' is not valid)`
        );
    }

    const configuration = await CONFIGURATION_WORKSPACE.read(storage, FILE_CONFIGURATION_WORKSPACE);

    const parsed_end = clamp(parseInt(end) || 0, 0, configuration.maxframes);
    const parsed_start = Math.max(parseInt(start) || 0, 0);

    if (parsed_end < parsed_start) {
        throw new RangeError(
            `bad query parameter '?end' to '/render.html' (parameter 'end' (${parsed_end}) is less than parameter 'start' (${parsed_start})'`
        );
    }

    const total_frames = parsed_end - parsed_start;
    const FRAMES: Record<number, string> = {};

    const frame = make_frame_store(parsed_start);
    const framerate = make_framerate_store(configuration.framerate);
    const maxframes = make_maxframes_store(configuration.maxframes);

    const playing = make_playing_store();

    window.addEventListener("error", (event) => {
        const error = event.error as Error;

        dispatch<IRenderErrorMessage>("RENDER_ERROR", {
            message: error.message,
            name: error.name,
        });
    });

    const result = await bundle({
        file,
        storage,
    });

    if ("errors" in result) {
        const [first_error] = result.errors;

        dispatch<IRenderErrorMessage>("RENDER_ERROR", {
            message: first_error.message,
            name: first_error.name,
        });

        return;
    }

    const module = evaluate_code<typeof SvelteComponent>(result.script, REPL_CONTEXT, REPL_IMPORTS);
    const {default: Component} = module;

    new Component({
        target: document.body,
        context: new Map<string, any>([
            [CONTEXT_FRAMERATE.key, framerate],
            [CONTEXT_MAXFRAMES.key, maxframes],

            [CONTEXT_FRAME.key, frame],
            [CONTEXT_PLAYING.key, playing],
        ]),
    });

    dispatch<IRenderStartMessage>("RENDER_START", {});

    for (let current_frame = parsed_start; current_frame <= parsed_end; current_frame++) {
        frame.set(current_frame);
        await tick();

        FRAMES[current_frame] = await toPng(document.documentElement);

        dispatch<IRenderProgressMessage>("RENDER_PROGRESS", {
            progress: (current_frame - parsed_start) / total_frames,
        });
    }

    dispatch<IRenderEndMessage>("RENDER_END", {
        frames: Object.values(FRAMES),
    });
})();
