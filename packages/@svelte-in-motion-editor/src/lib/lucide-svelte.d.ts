/// <reference types="svelte" />
/// <reference types="svelte2tsx/svelte-jsx" />

// HACK: Even though SVG allows for CSS units, Lucide Icons doesn't
// accept `size: string` by default. So we need to override

declare module "lucide-svelte" {
    import {SvelteComponentTyped} from "svelte";

    interface IconProps extends Partial<svelte.JSX.SVGProps<SVGSVGElement>> {
        color?: string;
        size?: number | string;
        strokeWidth?: number | string;
        class?: string;
    }

    interface IconEvents {
        [evt: string]: CustomEvent<any>;
    }

    export type Icon = SvelteComponentTyped<IconProps, IconEvents, {}>;

    // NOTE: Only put icons here being used by the Application

    export declare class Archive extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Check extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Clock extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Download extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class FileCode extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Edit extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Film extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Grid extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class PackageX extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Palmtree extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Pause extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Play extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class SkipBack extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class SkipForward extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class Video extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
    export declare class X extends SvelteComponentTyped<IconProps, IconEvents, {}> {}
}
