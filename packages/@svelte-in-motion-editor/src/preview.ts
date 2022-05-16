import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {get} from "svelte/store";

import {bundle} from "@svelte-in-motion/bundling";
import {
    CONFIGURATION_WORKSPACE,
    CONFIGURATION_WORKSPACES,
    preload_configuration,
} from "@svelte-in-motion/configuration";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    frame as make_frame_store,
    playing as make_playing_store,
} from "@svelte-in-motion/core";
import {evaluate_code, map, normalize_pathname} from "@svelte-in-motion/utilities";

import {dispatch, subscribe} from "./lib/messages";
import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/repl";
import {
    FILE_CONFIGURATION_WORKSPACE,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
    make_driver,
} from "./lib/storage";

import type {
    IPreviewDestroyMessage,
    IPreviewErrorMessage,
    IPreviewFrameMessage,
    IPreviewPlayingMessage,
    IPreviewMountMessage,
    IPreviewReadyMessage,
} from "./lib/types/preview";
import {MESSAGES_PREVIEW} from "./lib/types/preview";

(async () => {
    const url = new URL(location.href);
    const {file, workspace: workspace_identifier} = Object.fromEntries(url.searchParams.entries());

    if (!workspace_identifier) {
        throw new ReferenceError(
            "bad query parameter '?workspace' to '/preview.html' (no workspace specified)"
        );
    }

    const workspaces = await CONFIGURATION_WORKSPACES.read(
        STORAGE_USER,
        FILE_CONFIGURATION_WORKSPACES
    );

    const workspace = workspaces.find((workspace) => workspace.identifier === workspace_identifier);

    if (!workspace) {
        throw new ReferenceError(
            `bad query parameter '?workspace' to '/preview.html' (workspace '${workspace_identifier}' is not valid)`
        );
    }

    const storage = make_driver(workspace);

    if (!file) {
        throw new ReferenceError(
            "bad query parameter '?file' to '/preview.html' (no file specified)"
        );
    }

    if (!(await storage.exists(file))) {
        throw new ReferenceError(
            `bad query parameter '?file' to '/preview.html' (file '${file}' is not valid)`
        );
    }

    const configuration = map(
        await preload_configuration(storage, CONFIGURATION_WORKSPACE, FILE_CONFIGURATION_WORKSPACE)
    );

    const frame = make_frame_store();

    // HACK: The JSON Schema validation makes sure these properties are /ALWAYS/ a number
    const framerate = configuration.watch<number>("framerate") as Readable<number>;
    const maxframes = configuration.watch<number>("maxframes") as Readable<number>;

    const playing = make_playing_store();

    let _dependencies: Set<string> = new Set();

    let _component: SvelteComponent | null = null;
    let _nonce: object;

    async function update(): Promise<void> {
        const current_nonce = (_nonce = {});

        const result = await bundle({
            file,
            storage,
        });

        if (_nonce !== current_nonce) return;

        if ("errors" in result) {
            const [first_error] = result.errors;

            dispatch<IPreviewErrorMessage>(MESSAGES_PREVIEW.error, {
                message: first_error.message,
                name: first_error.name,
            });

            return;
        }

        _dependencies = new Set(
            result.dependencies.map((file_path) => normalize_pathname(file_path))
        );

        const module = evaluate_code<typeof SvelteComponent>(
            result.script,
            REPL_CONTEXT,
            REPL_IMPORTS
        );

        const {default: Component} = module;

        const $frame = get(frame);
        const $maxframes = get(maxframes);

        frame.set(Math.min($frame, $maxframes));

        if (_component) {
            _component.$destroy();
            _component = null;

            dispatch<IPreviewDestroyMessage>(MESSAGES_PREVIEW.destroy);
        }

        _component = new Component({
            target: document.body,
            context: new Map<string, any>([
                [CONTEXT_FRAMERATE.key, framerate],
                [CONTEXT_MAXFRAMES.key, maxframes],

                [CONTEXT_FRAME.key, frame],
                [CONTEXT_PLAYING.key, playing],
            ]),
        });

        dispatch<IPreviewMountMessage>(MESSAGES_PREVIEW.mount);
    }

    window.addEventListener("error", (event) => {
        const error = event.error as Error;

        dispatch<IPreviewErrorMessage>(MESSAGES_PREVIEW.error, {
            message: error.message,
            name: error.name,
        });
    });

    subscribe<IPreviewFrameMessage>(MESSAGES_PREVIEW.frame, (detail) => frame.set(detail.frame));
    subscribe<IPreviewPlayingMessage>(MESSAGES_PREVIEW.playing, (detail) =>
        playing.set(detail.playing)
    );

    storage.watch_directory("/", {
        exclude_directories: true,

        on_watch(event) {
            if (_dependencies.has(event.path)) update();
        },
    });

    update();

    dispatch<IPreviewReadyMessage>(MESSAGES_PREVIEW.ready);
})();
