import type {URLPatternResult} from "urlpattern-polyfill/dist/url-pattern.interfaces";
import {URLPattern} from "urlpattern-polyfill";

import {DEFAULT_ORIGIN} from "./url";

export type IRouterDefinitions<T> = Record<string, T>;

export interface IRouter<T> {
    exec(uri: string, base_url?: string): IRouterMatch<T> | null;
}

export interface IRouterMatch<T> {
    result: T;

    url: URLPatternResult;
}

export function router<T>(
    definitions: IRouterDefinitions<T>,
    base_url: string = DEFAULT_ORIGIN
): IRouter<T> {
    // HACK: Need to cache this here for `router.exec`
    const global_base_url = base_url;

    const mapped_routes: [URLPattern, T][] = Object.entries(definitions).map((route) => {
        const [pattern, result] = route;

        return [new URLPattern(pattern, base_url), result];
    });

    return {
        exec(uri, base_url = global_base_url) {
            for (const route of mapped_routes) {
                const [pattern, result] = route;

                const url = pattern.exec(uri, base_url);
                if (url) {
                    return {
                        result,
                        url,
                    };
                }
            }

            return null;
        },
    };
}
