import type {IMessage} from "./messages";

export enum MESSAGES_RENDER {
    end = "RENDER_END",
    error = "RENDER_ERROR",
    start = "RENDER_START",

    progress = "RENDER_PROGRESS",
}

export type IRenderEndMessage = IMessage<
    MESSAGES_RENDER.end,
    {
        frames: string[];
    }
>;

export type IRenderErrorMessage = IMessage<
    MESSAGES_RENDER.error,
    {
        message: string;

        name: string;
    }
>;

export type IRenderProgressMessage = IMessage<
    MESSAGES_RENDER.progress,
    {
        progress: number;
    }
>;

export type IRenderStartMessage = IMessage<MESSAGES_RENDER.start>;
