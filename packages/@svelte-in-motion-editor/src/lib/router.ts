import type {SvelteComponent} from "svelte";
import type {Readable, Writable} from "svelte/store";
import {derived, writable} from "svelte/store";
import type {URLPatternResult} from "urlpattern-polyfill/dist/url-pattern.interfaces";
import {URLPattern} from "urlpattern-polyfill";

import {normalize_relative} from "@svelte-in-motion/utilities";

export type IContext = Record<string, any>;

export type IProps = Record<string, any>;

export type ILoadCallback = (input: ILoadInput) => ILoadOutput | void | Promise<ILoadOutput | void>;

export type INavigatingStore = Readable<boolean>;

export type IRouterStore = Readable<IRouterOutput | null>;

export interface ILoadInput {
    results: URLPatternResult;

    url: URL;
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

interface IRoute {
    Component: typeof SvelteComponent;

    load?: ILoadCallback;

    pattern: URLPattern;
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

export function routes(...routes: IRouteDefinition[]): [INavigatingStore, IRouterStore] {
    let nonce = null;
    const loading = writable<boolean>(false);

    const parsed_routes = routes.map((definition) => {
        const {default: Component, load, pattern} = definition;

        return {
            Component,
            load,
            pattern: new URLPattern({pathname: pattern}),
        };
    });

    async function update(href: string, set: (value: IRouterOutput) => void): Promise<void> {
        loading.set(true);
        const current = (nonce = {});

        let results: URLPatternResult | undefined | null;
        let route: IRoute | null = null;

        for (const _route of parsed_routes) {
            results = _route.pattern.exec(href, location.href);
            if (results) {
                route = _route;
                break;
            }
        }

        if (!results || !route) return;

        let context: IContext | undefined;
        let props: IProps | undefined;

        if (route.load) {
            const url = new URL(href, location.href);
            const output = await route.load({results, url});

            if (output) {
                if (output.redirect) {
                    location.hash = output.redirect;
                    return;
                }

                ({context, props} = output);
            }
        }

        if (nonce !== current) return;

        set({
            Component: route.Component,

            context,
            props,
        });

        loading.set(false);
    }

    return [
        {subscribe: loading.subscribe},
        derived(hash(), ($hash, set) => {
            update($hash, set);
        }),
    ];
}
