import {ITemplateTypedItem, ITemplateUntypedItem} from "./types";

type IDefinedTemplate<T = void> = T extends void ? ITemplateUntypedItem : ITemplateTypedItem<T>;

export function define_template<T = void>(template: IDefinedTemplate<T>): IDefinedTemplate<T> {
    return template;
}
