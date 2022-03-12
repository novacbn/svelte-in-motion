export type IEvalulationContext = Record<string, any>;

export type IEvalulationModule<Default = null, Exports extends object = {}> = {
    default: Default;
    exports: Exports;
};

export type IEvaluationImports = Record<string, IEvalulationModule>;

export type IEvalulationRequire = (name: string) => IEvalulationModule;

export function evaluate_code<Default = null, Exports extends object = {}>(
    script: string,
    context: IEvalulationContext = {},
    imports: IEvaluationImports = {}
): IEvalulationModule<Default, Exports> {
    const keys = Object.keys(context);
    const values = Object.values(context);

    const module = {exports: {}};
    const require = make_require(imports);

    const func = new Function(
        ...keys,
        "require",
        "module",
        "exports",
        `return (function () {
                "use strict";
                ${script}
            })`
    )(...values, require, module, module.exports);

    func();

    const {default: module_default, ...module_exports} = module.exports as {default: Default};

    return {
        default: module_default,
        exports: module_exports as Exports,
    };
}

export function make_require(imports: IEvaluationImports = {}): IEvalulationRequire {
    return (name) => {
        if (name in imports) return imports[name];
        throw new ReferenceError(`bad argument #0 to 'require' (module '${name}' not found)`);
    };
}

export function validate_code(script: string): [false, string];
export function validate_code(script: string): [true, null];
export function validate_code(script: string): [boolean, string | null] {
    try {
        new Function(script);
    } catch (error: any) {
        return [false, error.message];
    }

    return [true, null];
}
