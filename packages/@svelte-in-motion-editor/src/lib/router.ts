import type {SvelteComponent} from "svelte";
import type {Readable, Writable} from "svelte/store";
import {derived, writable} from "svelte/store";
import type {URLPatternResult} from "urlpattern-polyfill/dist/url-pattern.interfaces";

import {
    normalize_pathname,
    normalize_relative,
    router as make_router,
} from "@svelte-in-motion/utilities";

export type IContext = Record<string, any>;

export type IProps = Record<string, any>;

export type ILoadCallback = (input: ILoadInput) => ILoadOutput | void | Promise<ILoadOutput | void>;

export type INavigatingStore = Readable<boolean>;

export type IRouterStore = Readable<IRouterOutput | null>;

export interface ILoadInput {
    url: URLPatternResult;
}

export interface ILoadOutput {
    context?: Record<string | symbol, any>;

    props?: Record<string, any>;

    redirect?: string;
}

export interface IRouteDefinition {
    default: typeof SvelteComponent;

    load?: ILoadCallback;

    pattern: string;
}

export interface IRouterOutput {
    Component: typeof SvelteComponent;

    context?: IContext;

    props?: IProps;
}

function hash(): Writable<string> {
    const {set, subscribe} = writable(location.hash.slice(1), (set) => {
        function on_popstate(event: PopStateEvent): void {
            const href = normalize_relative(location.hash.slice(1));

            set(href);
        }

        window.addEventListener("popstate", on_popstate);
        return () => window.removeEventListener("popstate", on_popstate);
    });

    return {
        set(value) {
            location.hash = normalize_relative(value);
        },
        subscribe,
        update(callback) {
            const href = normalize_relative(callback(location.hash.slice(1)));

            set(href);
        },
    };
}

export function app_router(...routes: IRouteDefinition[]): [INavigatingStore, IRouterStore] {
    let nonce = null;

    const navigating = writable<boolean>(false);
    const router = make_router<IRouteDefinition>(
        Object.fromEntries(
            routes.map((route) => {
                const {pattern} = route;

                return [normalize_pathname(pattern), route];
            })
        )
    );

    async function get_route(href: string): Promise<IRouterOutput | null> {
        navigating.set(true);
        const current = (nonce = {});

        const match = router.exec(href);
        if (!match) return null;

        let context: IContext | undefined;
        let props: IProps | undefined;

        if (match.result.load) {
            const output = await match.result.load({url: match.url});

            if (output) {
                if (output.redirect) {
                    location.hash = output.redirect;
                    return null;
                }

                ({context, props} = output);
            }
        }

        if (nonce !== current) return null;
        navigating.set(false);

        return {
            Component: match.result.default,

            context,
            props,
        };
    }

    const store = derived<Writable<string>, IRouterOutput | null>(hash(), ($hash, set) => {
        $hash = normalize_relative($hash);

        get_route($hash).then((output) => {
            set(output);
        });
    });

    return [{subscribe: navigating.subscribe}, store];
}
