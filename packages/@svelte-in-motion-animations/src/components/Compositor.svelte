<script lang="ts">
    import {onDestroy} from "svelte";

    import {
        CONTEXT_FRAME,
        CONTEXT_FRAMERATE,
        CONTEXT_MAXFRAMES,
        CONTEXT_PLAYING,
        frame as frame_store,
        framerate as framerate_store,
        maxframes as maxframes_store,
        playing as playing_store,
    } from "@svelte-in-motion/core";

    type $$Props = {
        frame: number;
        framerate: number;
        maxframes: number;

        playing?: boolean;
    };

    export let frame: $$Props["frame"];
    export let framerate: $$Props["framerate"];
    export let maxframes: $$Props["maxframes"];

    export let playing: $$Props["playing"] = undefined;

    const _frame = frame_store(frame);
    const _framerate = framerate_store(framerate);
    const _maxframes = maxframes_store(maxframes);

    const _playing = playing_store(playing);

    let handle: any = null;

    function configure_interval() {
        if ($_frame >= $_maxframes) $_frame = 0;

        const cache = (handle = setInterval(() => {
            $_frame += 1;

            if (!$_playing || $_frame >= $_maxframes || handle !== cache) {
                clearInterval(cache);
                if (handle === cache) {
                    handle = null;
                    $_playing = false;
                }
            }
        }, 1000 / framerate));
    }

    CONTEXT_FRAME.set(_frame);
    CONTEXT_FRAMERATE.set(_framerate);
    CONTEXT_MAXFRAMES.set(_maxframes);
    CONTEXT_PLAYING.set(_playing);

    onDestroy(() => {
        if (handle) clearInterval(handle);
    });

    $: frame = $_frame;
    $: framerate = $_framerate;
    $: maxframes = $_maxframes;

    $: playing = $_playing;
    $: if (playing) configure_interval();
</script>

<slot />
