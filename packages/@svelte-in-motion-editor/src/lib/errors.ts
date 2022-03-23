export interface IError {
    name: Error["name"];

    message: Error["message"];
}

export interface IPromptDismissError extends IError {
    name: "PromptDismissError";

    message: "Prompt was dismissed";
}

export function PromptDismissError(): IPromptDismissError {
    return {
        name: "PromptDismissError",
        message: "Prompt was dismissed",
    };
}

export function is_prompt_dismiss_error(value: any): value is IPromptDismissError {
    return typeof value === "object" && value.name === PromptDismissError.name;
}
