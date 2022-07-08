import type {IDriver} from "@svelte-in-motion/storage";
import {indexeddb} from "@svelte-in-motion/storage";
import type {Duration} from "@svelte-in-motion/temporal";
import {Instant, Now} from "@svelte-in-motion/temporal";
import {Ascii, MaxLength, MinLength, UUID, DataClass, uuid} from "@svelte-in-motion/type";

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

    name!: string & Ascii & MinLength<1> & MaxLength<32>;

    identifier: UUID = uuid();

    storage: WorkspacesItemStorageConfiguration = new WorkspacesItemStorageConfiguration();

    get_accessed_duration(): Duration {
        const current_instant = Now.instant();

        return this.accessed_at.until(current_instant, {largestUnit: "hour"});
    }

    format_accessed(): string {
        // HACK: Nothing supports `Intl.DurationFormat` yet, so have to manually handle output
        const duration = this.get_accessed_duration();
        const relative = new Intl.RelativeTimeFormat();

        if (duration.hours > 0) return relative.format(-duration.hours, "hour");
        else if (duration.minutes > 0) return relative.format(-duration.minutes, "minutes");
        return relative.format(-duration.seconds, "seconds");
    }

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
