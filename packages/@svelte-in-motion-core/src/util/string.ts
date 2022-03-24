export function format_camel_case(text: string): string {
    return text.replace(/-(\w)/, (match, character) => character.toUpperCase());
}
