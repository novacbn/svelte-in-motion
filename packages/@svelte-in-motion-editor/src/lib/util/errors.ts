export class PromptDismissError extends Error {
    message = "Prompt was dismissed";

    name = PromptDismissError.name;
}
