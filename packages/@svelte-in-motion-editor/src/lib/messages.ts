export interface IMessage {
    name: string;

    detail: Record<string, any>;
}

export function dispatch<T extends IMessage>(
    name: T["name"],
    detail: T["detail"],
    source: Window | HTMLIFrameElement = window
): void {
    if (source instanceof HTMLIFrameElement) {
        source.contentWindow?.postMessage({
            name,
            detail,
        });

        return;
    }

    source.postMessage({
        name,
        detail,
    });
}

export function listen<T extends IMessage>(
    name: T["name"],
    source: Window | HTMLIFrameElement = window
): Promise<T["detail"]> {
    return new Promise((resolve, reject) => {
        function on_message(event: MessageEvent): void {
            const message = event.data as IMessage;
            if (message.name === name) {
                resolve(message.detail);

                if (source instanceof HTMLIFrameElement) {
                    source.contentWindow?.removeEventListener("message", on_message);
                } else source.removeEventListener("message", on_message);
            }
        }

        if (source instanceof HTMLIFrameElement) {
            source.contentWindow?.addEventListener("message", on_message);
        } else source.addEventListener("message", on_message);
    });
}

export function subscribe<T extends IMessage>(
    name: T["name"],
    callback: (detail: T["detail"]) => void,
    source: Window | HTMLIFrameElement = window
): () => void {
    function on_message(event: MessageEvent): void {
        const message = event.data as IMessage;
        if (message.name === name) callback(message.detail);
    }

    if (source instanceof HTMLIFrameElement) {
        source.contentWindow?.addEventListener("message", on_message);
    } else source.addEventListener("message", on_message);

    return () => {
        if (source instanceof HTMLIFrameElement) {
            source.contentWindow?.removeEventListener("message", on_message);
        } else source.removeEventListener("message", on_message);
    };
}
