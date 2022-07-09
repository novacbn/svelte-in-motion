import type {IDriver} from "@svelte-in-motion/storage";
import type {TypeObjectLiteral} from "@svelte-in-motion/type";
import {validate} from "@svelte-in-motion/type";
import type {ICollectionStore} from "@svelte-in-motion/utilities";
import {collection} from "@svelte-in-motion/utilities";

export type ITemplateRender = string | Uint8Array;

export type ITemplateFunction<T> = (tokens: T) => ITemplateRender;

export type ITemplatePaths<T> = Record<string, ITemplateRender | ITemplateFunction<T>>;

export interface ITemplateItem<T = void> {
    identifier: string;

    paths: ITemplatePaths<T>;

    type?: TypeObjectLiteral;
}

export interface ITemplateTypedItem<T> extends ITemplateItem<T> {
    type: TypeObjectLiteral;
}

export interface ITemplatesStore
    extends ICollectionStore<ITemplateItem | ITemplateTypedItem<unknown>> {
    render<T>(storage: IDriver, identifier: string, tokens?: T): Promise<void>;
}

export function templates(): ITemplatesStore {
    const {find, has, push, subscribe, remove, update, watch} = collection<
        ITemplateItem | ITemplateTypedItem<unknown>
    >();

    return {
        find,
        has,
        push,

        async render(storage, identifier, tokens) {
            const item = find("identifier", identifier);
            if (!item) {
                throw new ReferenceError(
                    `bad argument #0 to 'templates.render' (template '${identifier}' not found)`
                );
            }

            if (item.type) {
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
                        // @ts-expect-error
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
