import type {IMessage} from "../messages";

export interface IRenderEndMessage extends IMessage {
    name: "RENDER_END";

    detail: {
        frames: string[];
    };
}

export interface IRenderErrorMessage extends IMessage {
    name: "RENDER_ERROR";

    detail: {
        message: string;

        name: string;
    };
}

export interface IRenderProgressMessage extends IMessage {
    name: "RENDER_PROGRESS";

    detail: {
        progress: number;
    };
}

export interface IRenderStartMessage extends IMessage {
    name: "RENDER_START";

    detail: {};
}
