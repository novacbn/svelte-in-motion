import type {IPromptRejectEvent} from "./stores/prompts";

export function PromptDismissError(): IPromptRejectEvent["error"] {
    return {
        name: "PromptDismissError",
        message: "Prompt was dismissed",
    };
}
