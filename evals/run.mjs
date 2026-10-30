/**
 * Phase 4 stub: read evals/cases.json and print count.
 * Prefer: pnpm eval (evals/run.ts)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesPath = join(__dirname, "cases.json");

const cases = JSON.parse(readFileSync(casesPath, "utf8"));

console.log("Eval cases:", cases.length);
console.log("(Use `pnpm eval` for the full runner.)");
