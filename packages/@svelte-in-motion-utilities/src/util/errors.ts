import type {SvelteComponent} from "svelte";

export class PromptError extends Error {
    name = PromptError.name;
}

export class PromptDismissError extends PromptError {
    message = "Prompt was dismissed";

    name = PromptDismissError.name;
}

export class TranslatedError<T = void> extends Error {
    name = TranslatedError.name;

    tokens?: T;

    constructor(tokens?: T) {
        super();

        this.tokens = tokens;
    }
}

export class UserError<T = void> extends TranslatedError<T> {
    // TODO: Once icon situation is resolved, should default to the X icon
    icon?: typeof SvelteComponent;

    name = UserError.name;

    constructor(tokens?: T, icon?: typeof SvelteComponent) {
        super(tokens);

        this.icon = icon;
    }
}
