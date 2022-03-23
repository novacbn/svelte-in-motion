import {BlobReader, BlobWriter, ZipWriter} from "@zip.js/zip.js";

export function download_blob(blob: Blob, file_name: string): void {
    const url = URL.createObjectURL(blob);
    const anchor_element = document.createElement("A");

    anchor_element.setAttribute("download", file_name);
    anchor_element.setAttribute("href", url);

    anchor_element.click();

    URL.revokeObjectURL(url);
    anchor_element.remove();
}

export function download_buffer(buffer: Uint8Array, file_name: string, mime_type: string): void {
    const blob = new Blob([buffer], {type: mime_type});

    download_blob(blob, file_name);
}

export async function zip_frames(frames: Uint8Array[]): Promise<Blob> {
    const blob_writer = new BlobWriter("application/zip");
    const zip_writer = new ZipWriter(blob_writer);

    await Promise.all(
        frames.map((buffer, index) => {
            const frame_blob = new Blob([buffer], {type: "image/png"});
            const blob_reader = new BlobReader(frame_blob);

            return zip_writer.add(`${index}.png`, blob_reader, {useWebWorkers: true});
        })
    );

    return zip_writer.close();
}
