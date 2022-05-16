import type {IMessage} from "./messages";

export enum MESSAGES_PREVIEW {
    destroy = "PREVIEW_DESTROY",
    error = "PREVIEW_ERROR",
    mount = "PREVIEW_MOUNT",
    ready = "PREVIEW_READY",

    frame = "PREVIEW_FRAME",
    playing = "PREVIEW_PLAYING",
}

export type IPreviewDestroyMessage = IMessage<MESSAGES_PREVIEW.destroy>;

export type IPreviewErrorMessage = IMessage<
    MESSAGES_PREVIEW.error,
    {
        message: string;

        name: string;
    }
>;

export type IPreviewFrameMessage = IMessage<
    MESSAGES_PREVIEW.frame,
    {
        frame: number;
    }
>;

export type IPreviewMountMessage = IMessage<MESSAGES_PREVIEW.mount>;

export type IPreviewPlayingMessage = IMessage<
    MESSAGES_PREVIEW.playing,
    {
        playing: boolean;
    }
>;

export type IPreviewReadyMessage = IMessage<MESSAGES_PREVIEW.ready>;
