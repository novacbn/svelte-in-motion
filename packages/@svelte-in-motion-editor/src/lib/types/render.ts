import type {IMessage} from "../messages";

export interface IRenderEndMessage extends IMessage {
    name: "RENDER_END";

    detail: {
        frames: string[];
    };
}

export interface IRenderFrameMessage extends IMessage {
    name: "RENDER_FRAME";

    detail: {
        frame: number;
    };
}

export interface IRenderStartMessage extends IMessage {
    name: "RENDER_START";

    detail: {};
}
