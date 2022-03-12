import type {IEvent} from "@svelte-in-motion/core";

export enum WATCH_EVENT_TYPES {
    create = "create",

    remove = "remove",

    update = "update",
}

export interface IDirectoryOptions {
    readonly exclude_directories?: boolean;

    readonly exclude_files?: boolean;

    readonly pattern?: string;
}

export interface IHotlinkHandle {
    readonly destroy: () => Promise<void>;

    readonly path: string;

    readonly url: string;
}

export interface IHotlinkOptions {
    readonly mimetype?: string;
}

export interface IStats {
    readonly is_directory: boolean;

    readonly is_file: boolean;
}

export type IWatchCallback = (event: IWatchEvent) => void;

export type IWatchUnsubscriber = () => void;

export interface IWatchEvent {
    readonly stats: IStats;

    readonly path: string;

    readonly type: `${WATCH_EVENT_TYPES}`;
}

export interface IWatchOptions extends IDirectoryOptions {
    readonly on_watch: IWatchCallback;
}

export type IWatchEventTarget = IEvent<IWatchEvent>;

export interface IDriver {
    create_directory(path: string): Promise<void>;

    create_file(path: string): Promise<void>;

    create_hotlink(path: string, options?: IHotlinkOptions): Promise<IHotlinkHandle>;

    create_view(path: string): IDriver;

    exists(path: string): Promise<boolean>;

    read_directory(path: string, options?: IDirectoryOptions): Promise<string[]>;

    read_file(path: string): Promise<Uint8Array>;

    remove_directory(path: string): Promise<void>;

    remove_file(path: string): Promise<void>;

    stats(path: string): Promise<IStats | null>;

    read_file(path: string): Promise<Uint8Array>;

    read_file_text(path: string): Promise<string>;

    watch_directory(path: string, options: IWatchOptions): Promise<IWatchUnsubscriber>;

    watch_file(path: string, callback: IWatchCallback): Promise<IWatchUnsubscriber>;

    write_file(path: string, buffer: Uint8Array): Promise<void>;

    write_file_text(path: string, text: string): Promise<void>;
}
