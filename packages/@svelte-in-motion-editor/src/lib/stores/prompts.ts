import type {
    PROPERTY_ALIGNMENT_X_BREAKPOINT,
    PROPERTY_ALIGNMENT_Y_BREAKPOINT,
    PROPERTY_SIZE_BREAKPOINT,
    PROPERTY_SPACING_BREAKPOINT,
} from "@kahi-ui/framework";
import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {writable} from "svelte/store";

import type {ClassProperties, Type} from "@svelte-in-motion/type";
import type {IEvent} from "@svelte-in-motion/utilities";
import {format_snake_case} from "@svelte-in-motion/utilities";
import {event} from "@svelte-in-motion/utilities";

import AboutPrompt from "../../components/prompts/AboutPrompt.svelte";
import AlertPrompt from "../../components/prompts/AlertPrompt.svelte";
import ConfirmPrompt from "../../components/prompts/ConfirmPrompt.svelte";
import FormPrompt from "../../components/prompts/FormPrompt.svelte";
import LoaderPrompt from "../../components/prompts/LoaderPrompt.svelte";
import SearchPrompt from "../../components/prompts/SearchPrompt.svelte";

export interface IAlertPromptProps {
    namespace: string;
}

export interface IConfirmPromptProps {
    namespace: string;
}

export interface IFormPromptEvent<T> {
    model: ClassProperties<T>;
}

export interface IFormPromptProps<T> {
    is_dismissible?: boolean;

    model?: Partial<ClassProperties<T>>;

    namespace: string;

    type: Type;
}

export interface ILoaderPromptProps {
    signal: AbortSignal;
}

export interface ISearchPromptEvent {
    identifier: string;
}

export interface ISearchPromptProps {
    badge?: string;

    description?: string;

    documents: Record<string, string | undefined>[];

    identifier: string;

    is_dismissible?: boolean;

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

export interface IPrompt<T extends Record<string, any>> {
    Component: typeof SvelteComponent;

    alignment_x?: PROPERTY_ALIGNMENT_X_BREAKPOINT;
    alignment_y?: PROPERTY_ALIGNMENT_Y_BREAKPOINT;

    margin_bottom?: PROPERTY_SPACING_BREAKPOINT;
    margin_left?: PROPERTY_SPACING_BREAKPOINT;
    margin_right?: PROPERTY_SPACING_BREAKPOINT;
    margin_top?: PROPERTY_SPACING_BREAKPOINT;

    height?: PROPERTY_SIZE_BREAKPOINT;
    width?: PROPERTY_SIZE_BREAKPOINT;

    is_dismissible?: boolean;

    title?: string;

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

    prompt_form<T>(props: IFormPromptProps<T>): Promise<IFormPromptEvent<T>>;

    prompt_loader(props: ILoaderPromptProps): Promise<void>;

    prompt_search(props: ISearchPromptProps): Promise<ISearchPromptEvent>;
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
                title: "prompts-about-label",
            });
        },

        prompt_alert(props) {
            return prompt<IAlertPromptProps, void>({
                Component: AlertPrompt,

                is_dismissible: true,
                title: `prompts-${props.namespace}-label`,
                props,
            });
        },

        prompt_confirm(props) {
            return prompt<IConfirmPromptProps, void>({
                Component: ConfirmPrompt,

                is_dismissible: true,
                title: `prompts-${props.namespace}-label`,
                props,
            });
        },

        prompt_form<T>(props: IFormPromptProps<T>) {
            return prompt<IFormPromptProps<T>, IFormPromptEvent<T>>({
                Component: FormPrompt,

                is_dismissible: props.is_dismissible,
                title: `prompts-${format_snake_case(props.namespace)}-label`,
                props,
            });
        },

        prompt_loader(props) {
            return prompt<ILoaderPromptProps, void>({
                Component: LoaderPrompt,

                props,
            });
        },

        prompt_search(props: ISearchPromptProps) {
            return prompt<ISearchPromptProps, ISearchPromptEvent>({
                Component: SearchPrompt,
                alignment_y: "top",
                margin_top: "large",
                width: "prose",

                is_dismissible: props.is_dismissible,
                props,
            });
        },

        subscribe,
    };
}
