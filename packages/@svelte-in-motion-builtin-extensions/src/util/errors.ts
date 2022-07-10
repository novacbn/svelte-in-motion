import {UserError} from "@svelte-in-motion/utilities";

export class NoEditorUserError extends UserError {
    name = NoEditorUserError.name;
}

export class NoPreviewUserError extends UserError {
    name = NoPreviewUserError.name;
}

export class NoWorkspaceUserError extends UserError {
    name = NoWorkspaceUserError.name;
}
