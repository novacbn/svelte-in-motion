import {ITemplateItem} from "./types";

export function define_template<Tokens, Template extends ITemplateItem<Tokens>>(
    template: Template
): Template {
    return template;
}
