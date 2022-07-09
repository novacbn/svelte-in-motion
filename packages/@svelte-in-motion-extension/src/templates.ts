import {ITemplateItem, ITemplateTypedItem} from "./types";

type IDefinedTemplate<T = void> = T extends void ? ITemplateItem : ITemplateTypedItem<T>;

export function define_template<T = void>(template: IDefinedTemplate<T>): IDefinedTemplate<T> {
    return template;
}
