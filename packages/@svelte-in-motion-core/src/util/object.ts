import {deepKeys, getProperty, setProperty} from "dot-prop";

export function deep_assign(
    target: Record<string, any>,
    source: Record<string, any>
): Record<string, any> {
    for (const path of deepKeys(source)) {
        const value = getProperty(source, path);

        setProperty(target, path, value);
    }

    return target;
}
