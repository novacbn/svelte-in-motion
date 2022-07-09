import type {IDriver} from "@svelte-in-motion/storage";
import type {TypeObjectLiteral} from "@svelte-in-motion/type";
import {validate} from "@svelte-in-motion/type";
import type {ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

import type {IAppContext} from "../app";

export type ITemplateRender = string | Uint8Array;

export type ITemplateFunction<T> = (tokens: T) => ITemplateRender;

export type ITemplatePaths<T> = Record<string, ITemplateRender | ITemplateFunction<T>>;

export interface ITemplateItem {
    identifier: string;
}

export interface ITemplateTypedItem<T> extends ITemplateItem {
    paths: ITemplatePaths<T>;

    type: TypeObjectLiteral;
}

export interface ITemplateUntypedItem extends ITemplateItem {
    paths: ITemplatePaths<void>;
}

export interface ITemplatesStore
    extends ICollectionStore<ITemplateTypedItem<unknown> | ITemplateUntypedItem> {
    render: ((storage: IDriver, identifier: string) => Promise<void>) &
        (<T>(storage: IDriver, identifier: string, tokens: T) => Promise<void>);

    push: ((item: ITemplateUntypedItem) => ITemplateUntypedItem) &
        (<T>(item: ITemplateTypedItem<T>) => ITemplateTypedItem<T>);
}

export function templates(app: IAppContext): ITemplatesStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<
        ITemplateTypedItem<unknown> | ITemplateUntypedItem
    >();

    return {
        find,
        has,
        // @ts-expect-error
        push,

        // @ts-expect-error
        async render<T>(storage: IDriver, identifier: string, tokens: T) {
            const item = find("identifier", identifier);
            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'templates.render' (template '${identifier}' not found)`
                );
            }

            if ("type" in item) {
                const [first_error] = validate(tokens, item.type);
                if (first_error) {
                    throw new Error(first_error.message);
                }
            }

            const files = Object.entries(item.paths).map<[string, string | Uint8Array]>((file) => {
                const [file_path, render] = file;

                if (typeof render === "function") {
                    return [
                        file_path,
                        // @ts-expect-error - HACK: TypeScript can't properly infer our tokens type
                        render(tokens),
                    ];
                }

                return [file_path, render];
            });

            await Promise.all(
                files.map((file) => {
                    const [file_path, content] = file;

                    return content instanceof Uint8Array
                        ? storage.write_file(file_path, content)
                        : storage.write_file_text(file_path, content.trim());
                })
            );
        },

        subscribe,
        remove,
        update,
        watch,
    };
}
