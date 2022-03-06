import Prism from "prismjs";

import "./syntaxes/prism-svelte";

/**
 * Highlights the given content with the selected syntax via PrismJS
 *
 * @param text
 * @param syntax
 * @returns
 */
export function highlight(text: string, syntax: string): string {
    return Prism.highlight(text, Prism.languages[syntax], syntax);
}
