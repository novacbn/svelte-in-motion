import type {IMessage} from "../messages";

export interface IPreviewDestroyMessage extends IMessage {
    name: "PREVIEW_DESTROY";

    detail: {};
}

export interface IPreviewErrorMessage extends IMessage {
    name: "PREVIEW_ERROR";

    detail: {
        message: string;

        name: string;

        stack?: string;
    };
}

export interface IPreviewFrameMessage extends IMessage {
    name: "PREVIEW_FRAME";

    detail: {
        frame: number;
    };
}

export interface IPreviewMountMessage extends IMessage {
    name: "PREVIEW_MOUNT";

    detail: {};
}

export interface IPreviewPlayingMessage extends IMessage {
    name: "PREVIEW_PLAYING";

    detail: {
        playing: boolean;
    };
}

export interface IPreviewReadyMessage extends IMessage {
    name: "PREVIEW_READY";

    detail: {};
}
