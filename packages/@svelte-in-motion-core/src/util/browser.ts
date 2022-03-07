export function idle(): Promise<void> {
    return new Promise((resolve, reject) => {
        requestIdleCallback(() => {
            resolve();
        });
    });
}
