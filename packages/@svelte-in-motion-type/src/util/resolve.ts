import type {TypeLiteral, metaAnnotation, validationAnnotation} from "@deepkit/type";

export type MetaAnnotation = ReturnType<typeof metaAnnotation["getAnnotations"]>[0];

export type ValidationAnnotation = ReturnType<typeof validationAnnotation["getAnnotations"]>[0];

export function resolveMetaLiteral<T>(
    annotations: MetaAnnotation[],
    name: string,
    index: number = 0
): T | undefined {
    const annotation = annotations.find((annotation) => annotation.name === name);
    if (annotation) {
        const type = annotation.options[index] as TypeLiteral;

        // @ts-expect-error
        return type.literal as T;
    }
}

export function resolveValidationLiteral<T>(
    annotations: ValidationAnnotation[],
    name: string,
    index: number = 0
): T | undefined {
    const annotation = annotations.find((annotation) => annotation.name === name);
    if (annotation) {
        const type = annotation.args[index] as TypeLiteral;

        // @ts-expect-error
        return type.literal as T;
    }
}
