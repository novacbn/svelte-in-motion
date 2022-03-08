import type {Readable} from "svelte/store";
import {get, readable} from "svelte/store";

import type {IFrameStore} from "./frame";
import {CONTEXT_FRAME} from "./frame";
import type {IFrameRateStore} from "./framerate";
import {CONTEXT_FRAMERATE} from "./framerate";
import type {IMaxFramesStore} from "./maxframes";
import {CONTEXT_MAXFRAMES} from "./maxframes";
import type {IPlayingStore} from "./playing";
import {CONTEXT_PLAYING} from "./playing";

// NOTE: abusing stores to handle lifecycle... feels clunky

export type IAdvanceStore = Readable<boolean>;

export const CONTEXT_ADVANCE = {
    has() {
        return (
            CONTEXT_FRAME.has() &&
            CONTEXT_MAXFRAMES.has() &&
            CONTEXT_FRAMERATE.has() &&
            CONTEXT_PLAYING.has()
        );
    },

    get() {
        const frame = CONTEXT_FRAME.get();
        if (!frame) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_FRAME.get' (context 'CONTEXT_FRAME' not available)`
            );
        }

        const framerate = CONTEXT_FRAMERATE.get();
        if (!framerate) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_ADVANCE.get' (context 'CONTEXT_FRAMERATE' not available)`
            );
        }

        const maxframes = CONTEXT_MAXFRAMES.get();
        if (!maxframes) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_ADVANCE.get' (contect 'CONTEXT_MAXFRAMES' not available)`
            );
        }

        const playing = CONTEXT_PLAYING.get();
        if (!playing) {
            throw new ReferenceError(
                `bad dispatch to 'CONTEXT_ADVANCE.get' (context 'CONTEXT_PLAYING' not available)`
            );
        }

        return advance(frame, framerate, maxframes, playing);
    },
};

export function advance(
    frame: IFrameStore,
    framerate: IFrameRateStore,
    maxframes: IMaxFramesStore,
    playing: IPlayingStore
): IAdvanceStore {
    return readable<boolean>(false, (set) => {
        let interval = 0;
        let handle: NodeJS.Timer | null = null;

        function advance_frame() {
            const $frame = get(frame) + 1;
            const $maxframes = get(maxframes);

            if ($frame > $maxframes) playing.set(false);
            else {
                frame.set($frame);
                handle = setTimeout(advance_frame, interval);
            }
        }

        const destroy_framerate = framerate.subscribe((value) => {
            interval = 1000 / value;
        });

        const destroy_playing = playing.subscribe((value) => {
            if (value) {
                const $frame = get(frame) + 1;
                const $maxframes = get(maxframes);

                if ($frame >= $maxframes) frame.set(0);

                advance_frame();
            } else if (handle) {
                clearTimeout(handle);
                handle = null;
            }

            set(value);
        });

        return () => {
            destroy_framerate();
            destroy_playing();
        };
    });
}