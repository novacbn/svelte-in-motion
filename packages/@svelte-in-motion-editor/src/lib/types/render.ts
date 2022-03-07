import type {IMessage} from "../messages";

export interface IRenderDestroyMessage extends IMessage {
    name: "RENDER_DESTROY";

    detail: {};
}

export interface IRenderErrorMessage extends IMessage {
    name: "RENDER_ERROR";

    detail: {
        message: string;

        name: string;

        stack?: string;
    };
}

export interface IRenderFrameMessage extends IMessage {
    name: "RENDER_FRAME";

    detail: {
        frame: number;
    };
}

export interface IRenderFramerateMessage extends IMessage {
    name: "RENDER_FRAMERATE";

    detail: {
        framerate: number;
    };
}

export interface IRenderMaxFramesMessage extends IMessage {
    name: "RENDER_MAXFRAMES";

    detail: {
        maxframes: number;
    };
}

export interface IRenderMountMessage extends IMessage {
    name: "RENDER_MOUNT";

    detail: {};
}

export interface IRenderPlayingMessage extends IMessage {
    name: "RENDER_PLAYING";

    detail: {
        playing: boolean;
    };
}

export interface IRenderReadyMessage extends IMessage {
    name: "RENDER_READY";

    detail: {};
}

export interface IRenderScriptMessage extends IMessage {
    name: "RENDER_SCRIPT";

    detail: {
        script: string;
    };
}
