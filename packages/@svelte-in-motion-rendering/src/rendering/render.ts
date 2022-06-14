export interface IRenderingOptions {
    bundle: string;

    end: number;

    framerate: number;

    maxframes: number;

    height: number;

    start: number;

    width: number;
}

export function RenderingOptions(options: IRenderingOptions): Required<IRenderingOptions> {
    const {bundle, end, framerate, height, maxframes, start, width} = options;

    return {
        bundle,
        end,
        framerate,
        maxframes,
        height,
        start,
        width,
    };
}
