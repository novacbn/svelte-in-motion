import {zip_blobs} from "@svelte-in-motion/storage";

export async function zip_frames(frames: Uint8Array[]): Promise<Blob> {
    const blobs = await Promise.all(
        frames.map((buffer, index) => {
            return {
                blob: new Blob([buffer], {type: "image/png"}),
                path: `${index}.png`,
            };
        })
    );

    return zip_blobs(blobs);
}
