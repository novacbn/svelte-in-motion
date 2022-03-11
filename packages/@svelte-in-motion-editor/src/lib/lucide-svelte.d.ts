/// <reference types="svelte" />
/// <reference types="svelte2tsx/svelte-jsx" />

// HACK: Even though SVG allows for CSS units, Lucide Icons doesn't
// accept `size: string` by default. So we need to override

declare module "lucide-svelte" {
    import {SvelteComponentTyped} from "svelte";

    interface IconProps extends Partial<svelte.JSX.SVGProps<SVGSVGElement>> {
        color?: string;
        size?: number | string;
        strokeWidth?: number;
        class?: string;
    }

    interface IconEvents {
        [evt: string]: CustomEvent<any>;
    }

    export type Icon = SvelteComponentTyped<IconProps, IconEvents, {}>;

    // NOTE: Only put icons here being used by the Application

    export declare class FileCode extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Edit extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Grid extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Palmtree extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Pause extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Play extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class SkipBack extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class SkipForward extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
}
