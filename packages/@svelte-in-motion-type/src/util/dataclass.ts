import {cast, is, resolveReceiveType, serialize} from "@deepkit/type";
import {parse} from "jsonc-parser";

import {JSON_SERIALIZER} from "../serializers/jsonserializer";

export interface IDataClassParseOptions {}

export interface IDataClassStringifyOptions {
    is_formatted?: boolean;
}

export class DataClass {
    static from<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        properties: any
    ): I | never {
        const data = cast<I>(
            properties,
            undefined,
            JSON_SERIALIZER,
            undefined,
            resolveReceiveType(this)
        );

        return data;
    }

    static is<B extends typeof DataClass, I = InstanceType<B>>(this: B, value: any): value is I {
        return is<I>(value, JSON_SERIALIZER, undefined, resolveReceiveType(this));
    }

    static parse<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        text: string,
        options: IDataClassParseOptions = {}
    ): I | never {
        const properties = parse(text);

        return this.from(properties);
    }

    static stringify<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        properties: any,
        options: IDataClassStringifyOptions = {}
    ): string | never {
        const {is_formatted = false} = options;

        const serialized = serialize<I>(
            properties,
            undefined,
            JSON_SERIALIZER,
            undefined,
            resolveReceiveType(this)
        );

        return JSON.stringify(serialized, null, is_formatted ? 4 : undefined);
    }

    clone(): this {
        return (this.constructor as typeof DataClass).from(this);
    }

    stringify(options?: IDataClassStringifyOptions): string | never {
        return (this.constructor as typeof DataClass).stringify(this, options);
    }
}
