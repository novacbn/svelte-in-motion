import {declarationTransformer, transformer} from "@deepkit/type-compiler";
import {transpileModule} from "typescript";
import {Plugin} from "vite";

// @ts-expect-error - HACK: just treat this as any
import TSCONFIG from "../tsconfig.json";

// HACK: DeepKit currently only works via injecting the local TypeScript compiler w/
// code to generate typing metadata for runtime. Which doesn't work for tools like esbuild
// which don't use the compiler

export function DeepkitTypePlugin(): Plugin {
    return {
        name: "deepkit-type",
        enforce: "pre",

        transform(code, file_name) {
            if (!file_name.endsWith(".type.ts")) return;

            const transformed = transpileModule(code, {
                fileName: file_name,
                compilerOptions: TSCONFIG.compilerOptions,

                transformers: {
                    before: [transformer],
                    afterDeclarations: [declarationTransformer],
                },
            });

            return {
                code: transformed.outputText,
                map: transformed.sourceMapText,
            };
        },
    };
}
