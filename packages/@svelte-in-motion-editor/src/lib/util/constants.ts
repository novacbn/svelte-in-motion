import PACKAGE from "../../../package.json";

import {append_pathname} from "@svelte-in-motion/utilities";

export const APPLICATION_VERSION = PACKAGE.version;

export const APPLICATION_URL = append_pathname(location.origin, import.meta.env.BASE_URL);
