import {Alphanumeric, DataClass, UUID, uuid} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

export class WorkspacesItemStorageConfiguration extends DataClass {
    // TODO: This needs to be dynamic some how... Otherwise extensions wouldn't be able to add more drivers
    driver: "indexeddb" = "indexeddb";

    configuration?: Record<string, boolean | number | null | string>;
}

export class WorkspacesItemConfiguration extends DataClass {
    accessed_at: Date = new Date();

    created_at: Date = new Date();

    name!: string & Alphanumeric;

    identifier: UUID = uuid();

    storage: WorkspacesItemStorageConfiguration = new WorkspacesItemStorageConfiguration();
}

export class WorkspacesConfiguration extends Configuration {
    workspaces: WorkspacesItemConfiguration[] = [];
}
