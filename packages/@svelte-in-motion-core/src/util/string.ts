import GithubSlugger from "github-slugger";

export function format_camel_case(text: string): string {
    return text.replace(/-(\w)/, (match, character) => character.toUpperCase());
}

export function format_slug(text: string): string {
    // NOTE: Aliasing here incase of future implementation change out
    const slugger = new GithubSlugger();

    return slugger.slug(text);
}
