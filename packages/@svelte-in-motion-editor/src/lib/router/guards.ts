import type {ILoadCallback} from "./router";

import {is_storage_prepared, prepare_storage} from "../storage";

export function GUARD_STORAGE(callback?: ILoadCallback): ILoadCallback {
    return async (input) => {
        if (!(await is_storage_prepared())) await prepare_storage();

        if (callback) return callback(input);
    };
}
