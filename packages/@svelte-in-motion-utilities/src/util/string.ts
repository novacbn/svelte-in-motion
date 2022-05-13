import GithubSlugger from "github-slugger";
import stringHash from "string-hash";

export function format_camel_case(text: string): string {
    return text.replace(/-(\w)/g, (match, character) => character.toUpperCase());
}

export function format_slug(text: string): string {
    // NOTE: Proxying incase implementation changes are wanted later

    const slugger = new GithubSlugger();
    return slugger.slug(text);
}

export function hash_string(text: string): number {
    // NOTE: Proxying incase implementation changes are wanted later

    return stringHash(text);
}
