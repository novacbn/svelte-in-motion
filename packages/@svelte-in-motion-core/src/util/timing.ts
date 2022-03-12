export function animation(): Promise<void> {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
            resolve();
        });
    });
}

export function debounce<F extends (...args: any[]) => any | Promise<any>>(
    func: F,
    duration: number = 0
): (...args: Parameters<F>) => void | Promise<void> {
    let identifier: number | undefined;

    return (...args: any[]) => {
        if (identifier !== undefined) {
            clearTimeout(identifier);
            identifier = undefined;
        }

        // @ts-ignore - HACK: NodeJS doesn't follow spec
        identifier = setTimeout(() => func(...args), duration);
    };
}

export function idle(): Promise<void> {
    return new Promise((resolve, reject) => {
        requestIdleCallback(() => {
            resolve();
        });
    });
}

export function throttle<F extends (...args: any[]) => any | Promise<any>>(
    func: F,
    duration: number = 0
): (...args: Parameters<F>) => void | Promise<void> {
    let previous_call = Number.MIN_SAFE_INTEGER;

    return (...args: any[]) => {
        const current_call = Date.now();
        if (current_call - previous_call >= duration) {
            func(...args);
            previous_call = current_call;
        }
    };
}

export function timeout(delay: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
