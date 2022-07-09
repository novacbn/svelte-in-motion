import type {SvelteComponent} from "svelte";

export class PromptError extends Error {
    name = PromptError.name;
}

export class PromptDismissError extends PromptError {
    message = "Prompt was dismissed";

    name = PromptDismissError.name;
}

export class UserError<T = void> extends Error {
    // TODO: Once icon situation is resolved, should default to the X icon
    icon?: typeof SvelteComponent;

    name = UserError.name;

    tokens?: T;

    constructor(tokens?: T, icon?: typeof SvelteComponent) {
        // @ts-expect-error - HACK: TypeScript just doesn't like that kind
        // of thing, but we can access it
        super(this.name);

        this.icon = icon;
        this.tokens = tokens;
    }
}
