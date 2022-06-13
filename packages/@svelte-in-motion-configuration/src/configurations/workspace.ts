import {Maximum, Minimum} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

export class WorkspaceConfiguration extends Configuration {
    framerate: number & Minimum<16> & Maximum<120> = 60;

    height: number & Minimum<0> & Maximum<4320> = 720;

    // NOTE: Not sure who would wait forever for an 8K render... Also
    // resolution is platform / codec dependant as well. But seems like a good default?

    maxframes: number & Minimum<0> = 60 * 60; // 60 seconds

    width: number & Minimum<0> & Maximum<7680> = 1280;
}
