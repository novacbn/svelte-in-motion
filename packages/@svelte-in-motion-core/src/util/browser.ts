export function idle(): Promise<void> {
    return new Promise((resolve, reject) => {
        requestIdleCallback(() => {
            resolve();
        });
    });
}

export function timeout(delay: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
