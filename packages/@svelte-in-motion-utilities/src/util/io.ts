import {BlobReader, BlobWriter, ZipWriter} from "@zip.js/zip.js";

export interface IBlobDefinition {
    blob: Blob;

    path: string;
}

export async function zip_blobs(blobs: IBlobDefinition[]): Promise<Blob> {
    const blob_writer = new BlobWriter("application/zip");
    const zip_writer = new ZipWriter(blob_writer);

    await Promise.all(
        blobs.map((definition, index) => {
            const {blob, path} = definition;
            const blob_reader = new BlobReader(blob);

            return zip_writer.add(path, blob_reader, {useWebWorkers: true});
        })
    );

    return zip_writer.close();
}
