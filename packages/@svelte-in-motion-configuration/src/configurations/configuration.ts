import type {IDriver} from "@svelte-in-motion/storage";
import type {IDataClassParseOptions, IDataClassStringifyOptions} from "@svelte-in-motion/type";
import {DataClass} from "@svelte-in-motion/type";

export class Configuration extends DataClass {
    static async read<B extends typeof DataClass, I = InstanceType<B>>(
        this: B,
        driver: IDriver,
        path: string,
        options: IDataClassParseOptions = {}
    ): Promise<I> | never {
        const buffer = await driver.read_file_text(path);
        const text = buffer.toString();

        return this.parse(text, options);
    }

    write(
        driver: IDriver,
        path: string,
        options?: IDataClassStringifyOptions
    ): Promise<void> | never {
        const text = this.stringify(options);

        return driver.write_file_text(path, text);
    }
}
