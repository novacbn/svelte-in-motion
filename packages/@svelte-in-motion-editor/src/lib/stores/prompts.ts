import type {
    PROPERTY_ALIGNMENT_X_BREAKPOINT,
    PROPERTY_ALIGNMENT_Y_BREAKPOINT,
    PROPERTY_SPACING_BREAKPOINT,
} from "@kahi-ui/framework";
import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {writable} from "svelte/store";

import type {ClassProperties, Type} from "@svelte-in-motion/type";
import type {IEvent} from "@svelte-in-motion/utilities";
import {event} from "@svelte-in-motion/utilities";

import AboutPrompt from "../../components/prompts/AboutPrompt.svelte";
import AlertPrompt from "../../components/prompts/AlertPrompt.svelte";
import ConfirmPrompt from "../../components/prompts/ConfirmPrompt.svelte";
import CreateWorkspace from "../../components/prompts/CreateWorkspace.svelte";
import FormPrompt from "../../components/prompts/FormPrompt.svelte";
import SearchPrompt from "../../components/prompts/SearchPrompt.svelte";

export interface ICommonPromptProps {
    is_dismissible?: boolean;

    title?: string;
}

export interface IAlertPromptProps extends Omit<ICommonPromptProps, "is_dismissible"> {
    text: string;
}

export interface ICreateWorkspacePromptEvent {
    name: string;
}

export interface IConfirmPromptProps extends ICommonPromptProps {
    text: string;
}

export interface IFormPromptEvent<T> {
    model: ClassProperties<T>;
}

export interface IFormPromptProps<T> extends ICommonPromptProps {
    model?: Partial<ClassProperties<T>>;

    type: Type;
}

export interface ISearchPromptPromptEvent {
    identifier: string;
}

export interface ISearchPromptProps extends ICommonPromptProps {
    documents: Record<string, string>[];

    identifier: string;

    index: string[];

    label: string;

    limit?: number;
}

export interface IPromptEvent {
    prompt: IPrompt<any>;
}

export interface IPromptResolveEvent<T> {
    result: T;
}

export interface IPromptRejectEvent {
    error: Error;
}

export interface IPrompt<T extends Record<string, any>> extends ICommonPromptProps {
    Component: typeof SvelteComponent;

    alignment_x?: PROPERTY_ALIGNMENT_X_BREAKPOINT;
    alignment_y?: PROPERTY_ALIGNMENT_Y_BREAKPOINT;

    margin_bottom?: PROPERTY_SPACING_BREAKPOINT;
    margin_left?: PROPERTY_SPACING_BREAKPOINT;
    margin_right?: PROPERTY_SPACING_BREAKPOINT;
    margin_top?: PROPERTY_SPACING_BREAKPOINT;

    props?: T;
}

export interface IPromptsStore extends Readable<IPrompt<any> | null> {
    EVENT_PROMPT: IEvent<IPromptEvent>;

    EVENT_REJECT: IEvent<IPromptRejectEvent>;

    EVENT_RESOLVE: IEvent<IPromptResolveEvent<any>>;

    clear(): void;

    prompt_about(): Promise<void>;

    prompt_alert(props: IAlertPromptProps): Promise<void>;

    prompt_confirm(props: IConfirmPromptProps): Promise<void>;

    prompt_create_workspace(): Promise<ICreateWorkspacePromptEvent>;

    prompt_form<T>(props: IFormPromptProps<T>): Promise<IFormPromptEvent<T>>;

    prompt_search(props: ISearchPromptProps): Promise<ISearchPromptPromptEvent>;
}

export function prompts(): IPromptsStore {
    const {set, subscribe} = writable<IPrompt<any> | null>(null);

    const EVENT_PROMPT = event<IPromptEvent>();
    const EVENT_REJECT = event<IPromptRejectEvent>();
    const EVENT_RESOLVE = event<IPromptResolveEvent<any>>();

    function prompt<Props, Result>(prompt: IPrompt<Props>): Promise<Result> {
        const active_element = document.activeElement;
        if (active_element instanceof HTMLElement) active_element.blur();

        set(prompt);
        EVENT_PROMPT.dispatch({prompt});

        return new Promise((resolve, reject) => {
            const destroy_reject = EVENT_REJECT.subscribe(({error}) => {
                destroy_reject();
                destroy_resolve();

                reject(error);
            });

            const destroy_resolve = EVENT_RESOLVE.subscribe(({result}) => {
                destroy_reject();
                destroy_resolve();

                resolve(result);
            });
        });
    }

    return {
        EVENT_PROMPT,
        EVENT_REJECT,
        EVENT_RESOLVE,

        clear() {
            set(null);
        },

        prompt_about() {
            return prompt<void, void>({
                Component: AboutPrompt,

                is_dismissible: true,
                title: "ui-prompt-about-title",
            });
        },

        prompt_alert(props) {
            return prompt<IAlertPromptProps, void>({
                Component: AlertPrompt,

                is_dismissible: true,
                title: props.title,
                props,
            });
        },

        prompt_confirm(props) {
            return prompt<IConfirmPromptProps, void>({
                Component: ConfirmPrompt,

                is_dismissible: props.is_dismissible,
                title: props.title,
                props,
            });
        },

        prompt_create_workspace() {
            return prompt<void, ICreateWorkspacePromptEvent>({
                Component: CreateWorkspace,

                is_dismissible: true,
            });
        },

        prompt_form<T>(props: IFormPromptProps<T>) {
            return prompt<IFormPromptProps<T>, IFormPromptEvent<T>>({
                Component: FormPrompt,

                is_dismissible: props.is_dismissible,
                title: props.title,
                props,
            });
        },

        prompt_search(props: ISearchPromptProps) {
            return prompt<ISearchPromptProps, ISearchPromptPromptEvent>({
                Component: SearchPrompt,
                alignment_y: "top",
                margin_top: "large",

                is_dismissible: props.is_dismissible,
                title: props.title,
                props,
            });
        },

        subscribe,
    };
}
