import {readFileSync, writeFileSync} from "fs";

const RUNTIME = JSON.stringify(readFileSync("./dist/src/index.html").toString())
    .slice(1, -1)
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

writeFileSync("./dist/index.js", `export const TEMPLATE_RUNTIME = ({payload}) => \`${RUNTIME}\``);

writeFileSync(
    "./dist/index.d.ts",
    `export declare const TEMPLATE_RUNTIME: (options: {payload: string}) => string;`
);
