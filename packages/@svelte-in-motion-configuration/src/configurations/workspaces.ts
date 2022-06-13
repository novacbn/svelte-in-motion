import {Alphanumeric, DataClass, UUID, uuid} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

export class WorkspacesItemConfiguration extends DataClass {
    readonly name!: string & Alphanumeric;

    readonly identifier: UUID = uuid();

    readonly last_accessed: Date = new Date();

    readonly storage: {
        // TODO: This needs to be dynamic some how... Otherwise extensions wouldn't be able to add more drivers
        readonly driver: "indexeddb";

        readonly configuration?: Record<string, boolean | number | null | string>;
    } = {
        driver: "indexeddb",
    };
}

export class WorkspacesConfiguration extends Configuration {
    readonly workspaces: WorkspacesItemConfiguration[] = [];
}
