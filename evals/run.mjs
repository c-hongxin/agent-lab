/**
 * 阶段 4 占位：读取 evals/cases.jsonc 并打印条数。
 * 完整跑分请用：pnpm eval（evals/run.ts）
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesPath = join(__dirname, "cases.jsonc");

// 与 src/lib/parse-jsonc.ts 同一规则：考卷里可以写 // 注释。
const cases = JSON.parse(stripJsonComments(readFileSync(casesPath, "utf8")));

function stripJsonComments(raw) {
  let out = "";
  let inString = false;
  let i = 0;
  while (i < raw.length) {
    const c = raw[i];
    const next = raw[i + 1];
    if (inString) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (c === '"') inString = false;
      i += 1;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < raw.length && raw[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

console.log("Eval cases:", cases.length);
console.log("(Use `pnpm eval` for the full runner.)");
