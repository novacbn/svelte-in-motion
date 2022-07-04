import type {SvelteComponent} from "svelte";
import {derived, get} from "svelte/store";

import {bundle} from "@svelte-in-motion/bundling";
import {WorkspaceConfiguration, WorkspacesConfiguration} from "@svelte-in-motion/configuration";
import {
    CONTEXT_FRAME,
    CONTEXT_FRAMERATE,
    CONTEXT_MAXFRAMES,
    CONTEXT_PLAYING,
    frame as make_frame_store,
    playing as make_playing_store,
} from "@svelte-in-motion/core";
import {evaluate_code, message, normalize_pathname} from "@svelte-in-motion/utilities";

import type {
    IPreviewDestroyMessage,
    IPreviewErrorMessage,
    IPreviewFrameMessage,
    IPreviewPlayingMessage,
    IPreviewMountMessage,
    IPreviewReadyMessage,
} from "./lib/types/preview";
import {MESSAGES_PREVIEW} from "./lib/types/preview";

import {REPL_CONTEXT, REPL_IMPORTS} from "./lib/util/repl";
import {
    FILE_CONFIGURATION_WORKSPACE,
    FILE_CONFIGURATION_WORKSPACES,
    STORAGE_USER,
} from "./lib/util/storage";

// TODO: Update to get previewed file from IPC rather than URL parameters. That
// way the iframe doesn't have to be teared down each file change

(async () => {
    const url = new URL(location.href);
    const {file, workspace: workspace_identifier} = Object.fromEntries(url.searchParams.entries());

    if (!workspace_identifier) {
        throw new ReferenceError(
            "bad query parameter '?workspace' to '/preview.html' (no workspace specified)"
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
            `bad query parameter '?workspace' to '/preview.html' (workspace '${workspace_identifier}' is not valid)`
        );
    }

    const storage = await workspace.make_driver();

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

    const configuration = await WorkspaceConfiguration.preload(
        storage,
        FILE_CONFIGURATION_WORKSPACE
    );

    const frame = make_frame_store();

    const framerate = derived(configuration, ($configuration) => $configuration.framerate);
    const maxframes = derived(configuration, ($configuration) => $configuration.maxframes);

    const playing = make_playing_store();

    const messages = message<
        | IPreviewDestroyMessage
        | IPreviewErrorMessage
        | IPreviewFrameMessage
        | IPreviewMountMessage
        | IPreviewPlayingMessage
        | IPreviewReadyMessage
    >(window);

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

            messages.dispatch({
                name: MESSAGES_PREVIEW.error,

                detail: {
                    message: first_error.message,
                    name: first_error.name,
                },
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

            messages.dispatch({
                name: MESSAGES_PREVIEW.destroy,
            });
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

        messages.dispatch({
            name: MESSAGES_PREVIEW.mount,
        });
    }

    window.addEventListener("error", (event) => {
        const error = event.error as Error;

        messages.dispatch({
            name: MESSAGES_PREVIEW.error,

            detail: {
                message: error.message,
                name: error.name,
            },
        });
    });

    messages.subscribe((message) => {
        switch (message.name) {
            case MESSAGES_PREVIEW.frame:
                frame.set(message.detail.frame);
                break;

            case MESSAGES_PREVIEW.playing:
                playing.set(message.detail.playing);
                break;
        }
    });

    storage.watch_directory("/", {
        exclude_directories: true,

        on_watch(event) {
            if (_dependencies.has(event.path)) update();
        },
    });

    update();

    messages.dispatch({
        name: MESSAGES_PREVIEW.ready,
    });
})();
