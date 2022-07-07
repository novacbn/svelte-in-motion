import type {IAppContext} from "./types";

export interface IExtension {
    identifier: string;

    is_builtin?: boolean;

    on_activate?: (app: IAppContext) => void;
}

export function define_extension<T extends IExtension>(extension: T): T {
    return extension;
}
