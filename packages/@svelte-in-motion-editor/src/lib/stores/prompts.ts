import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {writable} from "svelte/store";

import type {IEvent} from "@svelte-in-motion/core";
import {event} from "@svelte-in-motion/core";
import type {ICodecNames, IPixelFormatNames} from "@svelte-in-motion/encoding";

import AboutPrompt from "../../components/prompts/AboutPrompt.svelte";
import ExportVideoPrompt from "../../components/prompts/ExportVideoPrompt.svelte";

export interface IExportVideoPromptOptions {
    frame_min: number;

    frame_max: number;
}

export interface IExportVideoPromptEvent {
    codec: ICodecNames;

    crf: number;

    pixel_format: IPixelFormatNames;

    end: number;

    start: number;
}

export interface IPromptEvent {
    prompt: IPrompt<any>;
}

export interface IPromptResolveEvent<T> {
    result: T;
}

export interface IPromptRejectEvent {
    error: {
        name: Error["name"];

        message: Error["message"];
    };
}

export interface IPrompt<T extends Record<string, any>> {
    Component: typeof SvelteComponent;

    dismissible?: boolean;

    props?: T;
}

export interface IPromptStore extends Readable<IPrompt<any> | null> {
    EVENT_PROMPT: IEvent<IPromptEvent>;

    EVENT_REJECT: IEvent<IPromptRejectEvent>;

    EVENT_RESOLVE: IEvent<IPromptResolveEvent<any>>;

    clear(): void;

    prompt_about(): Promise<void>;

    prompt_export_video(props: IExportVideoPromptOptions): Promise<IExportVideoPromptEvent>;
}

function _prompts(): IPromptStore {
    const {set, subscribe} = writable<IPrompt<any> | null>(null);

    const EVENT_PROMPT = event<IPromptEvent>();
    const EVENT_REJECT = event<IPromptRejectEvent>();
    const EVENT_RESOLVE = event<IPromptResolveEvent<any>>();

    function prompt<Options, Result>(prompt: IPrompt<Options>): Promise<Result> {
        set(prompt);
        EVENT_PROMPT.dispatch({prompt});

        return new Promise((resolve, reject) => {
            const destroy_reject = EVENT_REJECT.subscribe(({error}) => {
                destroy_reject();
                destroy_resolve();

                reject({error});
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
            });
        },

        prompt_export_video(props) {
            return prompt<IExportVideoPromptOptions, IExportVideoPromptEvent>({
                Component: ExportVideoPrompt,
                props,
            });
        },

        subscribe,
    };
}

export const prompts = _prompts();

export const {EVENT_PROMPT} = prompts;
