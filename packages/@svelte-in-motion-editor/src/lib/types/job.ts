import type {IMessage} from "../messages";

export interface IJobEndMessage extends IMessage {
    name: "JOB_END";

    detail: {
        frames: string[];
    };
}

export interface IJobFrameMessage extends IMessage {
    name: "JOB_FRAME";

    detail: {
        frame: number;
    };
}

export interface IJobStartMessage extends IMessage {
    name: "JOB_START";

    detail: {};
}
