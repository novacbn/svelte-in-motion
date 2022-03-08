import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";
import type {IMaxFramesStore} from "./maxframes";
import {CONTEXT_MAXFRAMES} from "./maxframes";

export type ICompletionStore = Readable<number>;

export const CONTEXT_COMPLETION = {
    has() {
        return CONTEXT_FRAME.has() && CONTEXT_MAXFRAMES.has();
    },

    get() {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_COMPLETION.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        const maxframes = CONTEXT_MAXFRAMES.get();
        if (!maxframes) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_COMPLETION.get' (contect 'CONTEXT_MAXFRAMES' not available)`
            );
        }

        return completion(frame, maxframes);
    },
};

export function completion(frame: IFrameStore, maxframes: IMaxFramesStore): ICompletionStore {
    return derived([frame, maxframes], ([$frame, $maxframes]) => $frame / $maxframes);
}
