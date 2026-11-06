/**
 * 阶段 4 占位：读取 evals/cases.json 并打印条数。
 * 完整跑分请用：pnpm eval（evals/run.ts）
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesPath = join(__dirname, "cases.json");

const cases = JSON.parse(readFileSync(casesPath, "utf8"));

console.log("Eval cases:", cases.length);
console.log("(Use `pnpm eval` for the full runner.)");
