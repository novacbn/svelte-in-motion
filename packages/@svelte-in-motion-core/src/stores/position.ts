import {Readable} from "svelte/store";
import {derived} from "svelte/store";

import {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";
import {IMaxFramesStore} from "./maxframes";
import {CONTEXT_MAXFRAMES} from "./maxframes";

export type IPositionStore = Readable<number>;

export const CONTEXT_POSITION = {
    has() {
        return CONTEXT_FRAME.has() && CONTEXT_MAXFRAMES.has();
    },

    get() {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_POSITION.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        const maxframes = CONTEXT_MAXFRAMES.get();
        if (!maxframes) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_POSITION.get' (contect 'CONTEXT_MAXFRAMES' not available)`
            );
        }

        return position(frame, maxframes);
    },
};

export function position(frame: IFrameStore, maxframes: IMaxFramesStore): IPositionStore {
    return derived([frame, maxframes], ([$frame, $maxframes]) => $frame / $maxframes);
}
