import {cast, is, resolveReceiveType, serialize} from "@deepkit/type";

export interface IDataClassParseOptions {}

export interface IDataClassStringifyOptions {
    is_formatted?: boolean;
}

export class DataClass {
    static from<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        properties: any
    ): I | never {
        const data = cast<I>(properties, undefined, undefined, undefined, resolveReceiveType(this));

        return data;
    }

    static is<B extends typeof DataClass, I = InstanceType<B>>(this: B, value: any): value is I {
        return is<I>(value, undefined, undefined, resolveReceiveType(this));
    }

    static parse<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        text: string,
        options: IDataClassParseOptions = {}
    ): I | never {
        const properties = JSON.parse(text);

        return this.from(properties);
    }

    static stringify<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        properties: any,
        options: IDataClassStringifyOptions = {}
    ): string {
        const {is_formatted = false} = options;

        const serialized = serialize<I>(
            properties,
            undefined,
            undefined,
            undefined,
            resolveReceiveType(this)
        );

        return JSON.stringify(serialized, null, is_formatted ? 4 : undefined);
    }

    clone(): this {
        return (this.constructor as typeof DataClass).from(this);
    }

    stringify(options?: IDataClassStringifyOptions): string {
        return (this.constructor as typeof DataClass).stringify(this, options);
    }
}
