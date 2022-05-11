import type {IWorkspacesConfiguration} from "@svelte-in-motion/configuration";
import type {IDriver} from "@svelte-in-motion/storage";
import {indexeddb} from "@svelte-in-motion/storage";

export const STORAGE_DRIVERS = {
    indexeddb: {
        make(metadata: IWorkspacesConfiguration): IDriver {
            const {identifier} = metadata;

            return indexeddb(`sim:workspace:${identifier}`);
        },
    },
};

export function make_driver(metadata: IWorkspacesConfiguration): IDriver {
    const {driver: driver_name} = metadata.storage;
    const driver = STORAGE_DRIVERS[driver_name];

    if (!driver) {
        throw new ReferenceError(
            `bad argument #0 to 'make_driver' (invalid driver name '${driver_name}')`
        );
    }

    return driver.make(metadata);
}
