<script lang="ts">
    import type {PROPERTY_PALETTE} from "@kahi-ui/framework";
    import {Button, Card, DataSelect, Form, NumberInput, Stack} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
    import {
        get_available_codecs,
        get_available_crf_range,
        get_available_pixel_formats,
        get_codec_extension,
        get_default_codec,
        get_default_crf,
        get_default_pixel_format,
    } from "@svelte-in-motion/encoding";

    import {PromptDismissError} from "@svelte-in-motion/utilities";

    import type {IExportVideoPromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<IExportVideoPromptEvent>;
    };

    const dispatch = createEventDispatcher();

    const AVAILABLE_CODECS = get_available_codecs().map((codec, index) => {
        const extension = get_codec_extension(codec);

        return {
            id: codec as string,
            text: `${codec} (.${extension})`,
            palette: "accent" as PROPERTY_PALETTE,
        };
    });

    export let frame_max: number;
    export let frame_min: number;

    let ending_frame: number = frame_max;
    let starting_frame: number = frame_min;

    let codec: string = get_default_codec();
    let pixel_format: string;

    let crf: number;
    let crf_max: number;
    let crf_min: number;

    function on_close_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_start_click(event: MouseEvent): void {
        dispatch("resolve", {
            codec: codec as ICodecNames,
            crf,
            end: ending_frame,
            pixel_format: pixel_format as IPixelFormatNames,
            start: starting_frame,
        });
    }

    $: {
        // HACK: Just here to make this block reactive
        codec;

        crf = get_default_crf(codec as any);
        [crf_min, crf_max] = get_available_crf_range(codec as any);
    }

    let AVAILABLE_PIXEL_FORMATS: {id: string; text: string; palette: PROPERTY_PALETTE}[];
    $: {
        // HACK: Just here to make this block reactive
        codec;

        pixel_format = get_default_pixel_format(codec as any);

        AVAILABLE_PIXEL_FORMATS = codec
            ? get_available_pixel_formats(codec as any).map((pixel_format, index) => {
                  return {
                      id: pixel_format,
                      text: pixel_format,
                      palette: "accent",
                  };
              })
            : [];
    }
</script>

<Card.Header>Export Video</Card.Header>

<Card.Section>
    <Stack.Container spacing="small">
        <Form.Control logic_id="export-video-frame-start">
            <Form.Label>Starting Frame</Form.Label>

            <NumberInput
                min={frame_min}
                max={frame_max}
                sizing="nano"
                bind:value={starting_frame}
            />
        </Form.Control>

        <Form.Control logic_id="export-video-frame-end">
            <Form.Label>Ending Frame</Form.Label>

            <NumberInput min={frame_min} max={frame_max} sizing="nano" bind:value={ending_frame} />
        </Form.Control>

        <Form.Control logic_id="export-video-codec">
            <Form.Label>Codec</Form.Label>

            <DataSelect
                logic_name="export-video-codec"
                placeholder="Select a Codec"
                items={AVAILABLE_CODECS}
                sizing="nano"
                bind:logic_state={codec}
            />
        </Form.Control>

        <Form.Control logic_id="export-video-crf">
            <Form.Label>CRF</Form.Label>

            <NumberInput min={crf_min} max={crf_max} sizing="nano" bind:value={crf} />
        </Form.Control>

        <Form.Control logic_id="export-video-pixel-format">
            <Form.Label>Pixel Format</Form.Label>

            <DataSelect
                logic_name="export-video-pixel-format"
                placeholder="Select a Pixel Format"
                items={AVAILABLE_PIXEL_FORMATS}
                sizing="nano"
                bind:logic_state={pixel_format}
            />
        </Form.Control>
    </Stack.Container>
</Card.Section>

<Card.Footer alignment_x="stretch">
    <Button sizing="nano" variation="clear" palette="inverse" on:click={on_close_click}>
        Close
    </Button>

    <Button sizing="nano" variation="clear" palette="affirmative" on:click={on_start_click}>
        Start Job
    </Button>
</Card.Footer>
