export type Class<T> = new (...args: any[]) => T;

export type ClassProperties<T> = {
    [K in keyof T]: T[T[K] extends Function ? never : K];
};
