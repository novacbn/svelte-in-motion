import type {Node} from "code-red";
import {b} from "code-red";
import type {Schema} from "@cfworker/json-schema";
import {Validator} from "@cfworker/json-schema";
import {compile} from "svelte/compiler";

export function collect_properties(properties: Node[], collection = {}): Record<string, any> {
    return properties.reduce<Record<string, any>>((accum, node) => {
        // NOTE: We only want literal values, no references
        if (node.type === "Property" && node.kind === "init") {
            const {key, value} = node;
            if (key.type === "Identifier") {
                switch (value.type) {
                    case "Literal":
                        accum[key.name] = value.value;
                        break;

                    case "ObjectExpression":
                        accum[key.name] = collect_properties(value.properties);
                        break;
                }
            }
        }

        return accum;
    }, collection);
}

export function collect_metadata(ast: Node[], name: string): Record<string, any> {
    const node = ast.find((node) => {
        if (node.type !== "VariableDeclaration" || node.kind !== "const") {
            return false;
        }

        const {id} = node.declarations[0];

        return id.type === "Identifier" && id.name === name;
    });

    if (!node || node.type !== "VariableDeclaration") return {};

    const [declaration] = node.declarations;

    return declaration.init?.type === "ObjectExpression"
        ? collect_properties(declaration.init?.properties)
        : {};
}

export function parse_ast(source: string): Node[] {
    const {js} = compile(source, {
        generate: "ssr",
    });

    // @ts-expect-error - HACK: Type mismatch due to being a string literal function, but it'll work
    return b([js.code]);
}

export function validate_configuration<T>(value: any, schema: Schema): value is T {
    const validator = new Validator(schema, "2020-12", false);
    const result = validator.validate(value);

    // TODO: better error handling
    if (!result.valid) false;
    return true;
}
