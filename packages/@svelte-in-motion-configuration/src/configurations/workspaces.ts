import {Alphanumeric, DataClass, UUID, uuid} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

export class WorkspacesItemStorageConfiguration extends DataClass {
    // TODO: This needs to be dynamic some how... Otherwise extensions wouldn't be able to add more drivers
    readonly driver: "indexeddb" = "indexeddb";

    readonly configuration?: Record<string, boolean | number | null | string>;
}

export class WorkspacesItemConfiguration extends DataClass {
    readonly accessed_at: Date = new Date();

    readonly created_at: Date = new Date();

    readonly name!: string & Alphanumeric;

    readonly identifier: UUID = uuid();

    readonly storage: WorkspacesItemStorageConfiguration = new WorkspacesItemStorageConfiguration();
}

export class WorkspacesConfiguration extends Configuration {
    readonly workspaces: WorkspacesItemConfiguration[] = [];
}
