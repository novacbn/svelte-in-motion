import {TEMPLATE_RUNTIME} from "@svelte-in-motion/runtime";
import type {IEvent} from "@svelte-in-motion/utilities";
import {IS_BROWSER, event} from "@svelte-in-motion/utilities";

enum RUNTIME_EVENTS {
    error,

    start,

    progress,

    end,
}

const TEMPLATE_PAYLOAD = (options: IRenderingOptions) =>
    `
const sim_core = require("@svelte-in-motion/core");
const sim_screenshot = require("@svelte-in-motion/screenshot");
const svelte = require("svelte");

const cache = {};

const frame = sim_core.frame(${options.start});
const framerate = sim_core.framerate(${options.framerate});
const maxframes = sim_core.maxframes(${options.maxframes});

window.addEventListener("error", (event) => {
    window.postMessage(
        {
            type: ${RUNTIME_EVENTS.error},
            message: event.error.message,
            name: event.error.name,
        },
        "${location.origin}"
    );
});

eval(${JSON.stringify(options.script)});

const component = new module.exports.default({
    target: document.body,
    context: new Map([
        [sim_core.CONTEXT_FRAME.key, frame],
        [sim_core.CONTEXT_FRAMERATE.key, framerate],
        [sim_core.CONTEXT_MAXFRAMES.key, maxframes],
    ]),
});

window.postMessage(
    {
        type: ${RUNTIME_EVENTS.start},
    },
    "${location.origin}"
);

for (let current_frame = ${options.start}; current_frame <= ${options.end}; current_frame++) {
    frame.set(current_frame);
    await svelte.tick();

    cache[current_frame] = await sim_screenshot.screenshot_node(
        document.documentElement
    );

    window.postMessage(
        {
            type: ${RUNTIME_EVENTS.progress},
            progress: (current_frame - ${options.start}) / ${options.end - options.start},
        },
        "${location.origin}"
    );
}

window.postMessage(
    {
        type: ${RUNTIME_EVENTS.end},
        frames: Object.values(cache),
    },
    "${location.origin}"
);
`;

interface IRuntimeEvent {
    type: RUNTIME_EVENTS;
}

interface IRuntimeEndMessage extends IRuntimeEvent {
    type: RUNTIME_EVENTS.end;

    frames: Uint8Array[];
}

interface IRuntimeErrorMessage extends IRuntimeEvent {
    type: RUNTIME_EVENTS.error;

    message: string;

    name: string;
}

interface IRuntimeProgressMessage extends IRuntimeEvent {
    type: RUNTIME_EVENTS.progress;

    progress: number;
}

interface IRuntimeStartMessage extends IRuntimeEvent {
    type: RUNTIME_EVENTS.start;
}

export type IRenderingErrorEvent = IEvent<{message: string; name: string}>;

export type IRenderingEndEvent = IEvent<Uint8Array[]>;

export type IRenderingInitializeEvent = IEvent<void>;

export type IRenderingProgressEvent = IEvent<number>;

export type IRenderingStartEvent = IEvent<void>;

export interface IRenderingHandle {
    EVENT_ERROR: IRenderingErrorEvent;

    EVENT_END: IRenderingEndEvent;

    EVENT_INITIALIZE: IRenderingInitializeEvent;

    EVENT_PROGRESS: IRenderingProgressEvent;

    EVENT_START: IRenderingStartEvent;
}

export interface IRenderingOptions {
    end: number;

    framerate: number;

    maxframes: number;

    height: number;

    script: string;

    start: number;

    width: number;
}

export function RenderingOptions(options: Partial<IRenderingOptions> = {}): IRenderingOptions {
    let {
        end = 0,
        framerate = 60,
        height = 1080,
        maxframes = 60 * 1,
        script = "",
        start = 0,
        width = 1920,
    } = options;

    end = Math.min(Math.max(start, end, 0), maxframes);
    start = Math.max(start, 0);

    return {
        end,
        framerate,
        maxframes,
        height,
        script,
        start,
        width,
    };
}

export function render(options: Partial<IRenderingOptions>): IRenderingHandle {
    if (!IS_BROWSER) {
        throw new Error("bad dispatch to 'render' (platforms besides Browsers are not supported)");
    }

    options = RenderingOptions(options);
    const {height, width} = options;

    const payload = TEMPLATE_PAYLOAD(options as IRenderingOptions);
    const runtime = TEMPLATE_RUNTIME({payload});

    const EVENT_ERROR: IRenderingErrorEvent = event();
    const EVENT_END: IRenderingEndEvent = event();
    const EVENT_INITIALIZE: IRenderingInitializeEvent = event();
    const EVENT_PROGRESS: IRenderingProgressEvent = event();
    const EVENT_START: IRenderingStartEvent = event();

    const iframe_element = document.createElement("IFRAME") as HTMLIFrameElement;

    iframe_element.style.position = "fixed";
    iframe_element.style.pointerEvents = "none";
    iframe_element.style.opacity = "0";

    iframe_element.style.height = `${height}px`;
    iframe_element.style.width = `${width}px`;

    iframe_element.srcdoc = runtime;

    function on_load(event: Event): void {
        iframe_element.removeEventListener("load", on_load);
        EVENT_INITIALIZE.dispatch();

        function on_message(
            event: MessageEvent<
                | IRuntimeEndMessage
                | IRuntimeErrorMessage
                | IRuntimeProgressMessage
                | IRuntimeStartMessage
            >
        ): void {
            const message = event.data;

            switch (message.type) {
                case RUNTIME_EVENTS.end:
                    EVENT_END.dispatch(message.frames);

                    iframe_element.contentWindow!.removeEventListener("message", on_message);
                    iframe_element.remove();

                    break;

                case RUNTIME_EVENTS.error:
                    EVENT_ERROR.dispatch({
                        name: message.name,
                        message: message.message,
                    });

                    iframe_element.contentWindow!.removeEventListener("message", on_message);
                    iframe_element.remove();

                    break;

                case RUNTIME_EVENTS.progress:
                    EVENT_PROGRESS.dispatch(message.progress);

                    break;

                case RUNTIME_EVENTS.start:
                    EVENT_START.dispatch();

                    break;
            }
        }

        iframe_element.contentWindow!.addEventListener("message", on_message);
    }

    iframe_element.addEventListener("load", on_load);
    document.body.appendChild(iframe_element);

    return {
        EVENT_ERROR,
        EVENT_END,
        EVENT_INITIALIZE,
        EVENT_PROGRESS,
        EVENT_START,
    };
}
