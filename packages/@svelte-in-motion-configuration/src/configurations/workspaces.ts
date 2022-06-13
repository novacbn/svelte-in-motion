import type {IDriver} from "@svelte-in-motion/storage";
import {indexeddb} from "@svelte-in-motion/storage";
import {Instant, Now} from "@svelte-in-motion/temporal";
import {Alphanumeric, UUID, DataClass, uuid} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

const STORAGE_DRIVERS = {
    indexeddb: {
        async make(metadata: WorkspacesItemConfiguration): Promise<IDriver> {
            const {identifier} = metadata;

            return indexeddb(`sim:workspace:${identifier}`);
        },
    },
};

export class WorkspacesItemStorageConfiguration extends DataClass {
    // TODO: This needs to be dynamic some how... Otherwise extensions wouldn't be able to add more drivers
    driver: "indexeddb" = "indexeddb";

    configuration?: Record<string, boolean | number | null | string>;
}

export class WorkspacesItemConfiguration extends DataClass {
    accessed_at: Instant = Now.instant();

    created_at: Instant = Now.instant();

    name!: string & Alphanumeric;

    identifier: UUID = uuid();

    storage: WorkspacesItemStorageConfiguration = new WorkspacesItemStorageConfiguration();

    make_driver(): Promise<IDriver> {
        // TODO: this needs to become extendable via extensions
        const {driver: driver_name} = this.storage;
        const driver = STORAGE_DRIVERS[driver_name];

        if (!driver) {
            throw new ReferenceError(
                `bad argument #0 to 'make_driver' (invalid driver name '${driver_name}')`
            );
        }

        return driver.make(this);
    }
}

export class WorkspacesConfiguration extends Configuration {
    workspaces: WorkspacesItemConfiguration[] = [];
}
