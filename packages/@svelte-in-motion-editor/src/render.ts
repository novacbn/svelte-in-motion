import {toPng} from "html-to-image";
import type {SvelteComponent} from "svelte";
import {tick} from "svelte";

import {bundle} from "@svelte-in-motion/bundling";
import {WorkspaceConfiguration, WorkspacesConfiguration} from "@svelte-in-motion/configuration";
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
import {clamp, evaluate_code, message} from "@svelte-in-motion/utilities";

import type {
    IRenderEndMessage,
    IRenderErrorMessage,
    IRenderProgressMessage,
    IRenderStartMessage,
} from "./lib/types/render";
import {MESSAGES_RENDER} from "./lib/types/render";

import {
    FILE_CONFIGURATION_WORKSPACE,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
} from "./lib/util/storage";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/util/repl";

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

    const workspaces = await WorkspacesConfiguration.read(
        STORAGE_USER,
        FILE_CONFIGURATION_WORKSPACES
    );

    const workspace = workspaces.workspaces.find(
        (workspace) => workspace.identifier === workspace_identifier
    );

    if (!workspace) {
        throw new ReferenceError(
            `bad query parameter '?workspace' to '/render.html' (workspace '${workspace_identifier}' is not valid)`
        );
    }

    const storage = await workspace.make_driver();

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

    const configuration = await WorkspaceConfiguration.read(storage, FILE_CONFIGURATION_WORKSPACE);

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

    const messages = message<
        IRenderEndMessage | IRenderErrorMessage | IRenderProgressMessage | IRenderStartMessage
    >(window);

    window.addEventListener("error", (event) => {
        const error = event.error as Error;

        messages.dispatch({
            name: MESSAGES_RENDER.error,
            detail: {
                message: error.message,
                name: error.name,
            },
        });
    });

    const result = await bundle({
        file,
        storage,
    });

    if ("errors" in result) {
        const [first_error] = result.errors;

        messages.dispatch({
            name: MESSAGES_RENDER.error,
            detail: {
                message: first_error.message,
                name: first_error.name,
            },
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

    messages.dispatch({
        name: MESSAGES_RENDER.start,
    });

    for (let current_frame = parsed_start; current_frame <= parsed_end; current_frame++) {
        frame.set(current_frame);
        await tick();

        FRAMES[current_frame] = await toPng(document.documentElement);

        messages.dispatch({
            name: MESSAGES_RENDER.progress,
            detail: {
                progress: (current_frame - parsed_start) / total_frames,
            },
        });
    }

    messages.dispatch({
        name: MESSAGES_RENDER.end,
        detail: {
            frames: Object.values(FRAMES),
        },
    });
})();
