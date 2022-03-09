export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function truncate(value: number, precision: number): number {
    const place = Math.pow(10, precision);

    return Math.floor(value * place) / place;
}
