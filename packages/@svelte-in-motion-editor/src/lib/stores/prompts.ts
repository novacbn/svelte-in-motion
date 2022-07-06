import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {writable} from "svelte/store";

import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";
import type {ClassProperties, Type} from "@svelte-in-motion/type";
import type {IEvent} from "@svelte-in-motion/utilities";
import {event} from "@svelte-in-motion/utilities";

import AboutPrompt from "../../components/prompts/AboutPrompt.svelte";
import CreateWorkspace from "../../components/prompts/CreateWorkspace.svelte";
import ExportFramesPrompt from "../../components/prompts/ExportFramesPrompt.svelte";
import ExportVideoPrompt from "../../components/prompts/ExportVideoPrompt.svelte";
import FormPrompt from "../../components/prompts/FormPrompt.svelte";
import SearchPrompt from "../../components/prompts/SearchPrompt.svelte";

export interface ICommonPromptProps {
    is_dismissible?: boolean;

    title?: string;
}

export interface IFormPromptProps<T> {
    model?: Partial<ClassProperties<T>>;

    type: Type;
}

export interface IFormPromptEvent<T> {
    model: ClassProperties<T>;
}

export interface ICreateWorkspacePromptEvent {
    name: string;
}

export interface IExportFramesPromptProps {
    frame_min: number;

    frame_max: number;
}

export interface IExportVideoPromptProps extends IExportFramesPromptProps {}

export interface IExportFramesPromptEvent {
    end: number;

    start: number;
}

export interface IExportVideoPromptEvent extends IExportFramesPromptEvent {
    codec: ICodecNames;

    crf: number;

    pixel_format: IPixelFormatNames;
}

export interface ISearchPromptPromptEvent {
    identifier: string;
}

export interface ISearchPromptProps {
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

    props?: T;
}

export interface IPromptsStore extends Readable<IPrompt<any> | null> {
    EVENT_PROMPT: IEvent<IPromptEvent>;

    EVENT_REJECT: IEvent<IPromptRejectEvent>;

    EVENT_RESOLVE: IEvent<IPromptResolveEvent<any>>;

    clear(): void;

    prompt_about(): Promise<void>;

    prompt_create_workspace(): Promise<ICreateWorkspacePromptEvent>;

    prompt_export_frames(props: IExportFramesPromptProps): Promise<IExportFramesPromptEvent>;

    prompt_export_video(props: IExportVideoPromptProps): Promise<IExportVideoPromptEvent>;

    prompt_form<T>(props: IFormPromptProps<T> & ICommonPromptProps): Promise<IFormPromptEvent<T>>;

    prompt_search(
        props: ISearchPromptProps & ICommonPromptProps
    ): Promise<ISearchPromptPromptEvent>;
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
            });
        },

        prompt_create_workspace() {
            return prompt<void, ICreateWorkspacePromptEvent>({
                Component: CreateWorkspace,
                is_dismissible: true,
            });
        },

        prompt_export_frames(props) {
            return prompt<IExportFramesPromptProps, IExportFramesPromptEvent>({
                Component: ExportFramesPrompt,
                is_dismissible: true,
                props,
            });
        },

        prompt_export_video(props) {
            return prompt<IExportVideoPromptProps, IExportVideoPromptEvent>({
                Component: ExportVideoPrompt,
                is_dismissible: true,
                props,
            });
        },

        prompt_form<T>(props: IFormPromptProps<T> & ICommonPromptProps) {
            return prompt<IFormPromptProps<T>, IFormPromptEvent<T>>({
                Component: FormPrompt,
                is_dismissible: props.is_dismissible,
                title: props.title,
                props,
            });
        },

        prompt_search(props: ISearchPromptProps & ICommonPromptProps) {
            return prompt<ISearchPromptProps, ISearchPromptPromptEvent>({
                Component: SearchPrompt,
                is_dismissible: props.is_dismissible,
                title: props.title,
                props,
            });
        },

        subscribe,
    };
}
