// 阶段 4：用 Demo C workbench tools 跑 evals/cases.jsonc，按 expect 打分并打印汇总。
// 用法：pnpm eval。每种失败标记的含义写在 cases.jsonc 文件头。

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateText, stepCountIs } from "ai";

import { resolveModel } from "../src/lib/ai/resolve-model";
import { workbenchSystemPrompt } from "../src/lib/ai/workbench-system";
import { parseJsonc } from "../src/lib/parse-jsonc";
import { previewNotification } from "../src/lib/tools/preview-tools";
import {
  exportLocaleSnippet,
  getCopySchema,
  listTriggerTypes,
  validateFields,
} from "../src/lib/tools/workbench-tools";
import { publishCopy, sendTestEmail } from "../src/lib/tools/write-tools";

type Expect = {
  tools_include?: string[];
  // 卷子上标明期望的 code，当前打分不拿它和模型入参对比。
  trigger_type_code?: string;
  validate_ok?: boolean;
  missing_fields?: string[];
  locales?: string[];
};

type Case = {
  id: string;
  category: string;
  input: string;
  expect: Expect;
};

type FailKind =
  | "tool_miss"
  | "validate_mismatch"
  | "missing_mismatch"
  | "locale_miss"
  | "error";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cases = parseJsonc<Case[]>(
  readFileSync(join(__dirname, "cases.jsonc"), "utf8"),
);

const tools = {
  listTriggerTypes,
  getCopySchema,
  validateFields,
  previewNotification,
  exportLocaleSnippet,
  publishCopy,
  sendTestEmail,
};

// AI SDK 不同版本把入参放在 input 或 args，把结果放在 output 或 result。两种都读。
type StepLike = {
  toolCalls?: Array<{
    toolName: string;
    args?: unknown;
    input?: unknown;
  }>;
  toolResults?: Array<{
    toolName: string;
    result?: unknown;
    output?: unknown;
  }>;
};

function collectToolNames(steps: StepLike[]) {
  const names = new Set<string>();
  for (const step of steps) {
    for (const call of step.toolCalls ?? []) {
      names.add(call.toolName);
    }
  }
  return names;
}

function collectValidateResults(steps: StepLike[]) {
  const outs: Array<{ ok?: boolean; missing?: string[] }> = [];
  for (const step of steps) {
    for (const tr of step.toolResults ?? []) {
      if (tr.toolName !== "validateFields") continue;
      const r = (tr.output ?? tr.result) as
        | { ok?: boolean; missing?: string[] }
        | undefined;
      if (r) outs.push(r);
    }
  }
  return outs;
}

// 只看 exportLocaleSnippet 入参里的 locale，不看工具返回值。多调别的 locale 不算错。
function collectExportLocales(steps: StepLike[]) {
  const locales = new Set<string>();
  for (const step of steps) {
    for (const call of step.toolCalls ?? []) {
      if (call.toolName !== "exportLocaleSnippet") continue;
      const payload = (call.input ?? call.args) as
        | Record<string, unknown>
        | undefined;
      const locale = payload?.locale;
      if (typeof locale === "string") locales.add(locale);
    }
  }
  return locales;
}

// 对照这题的 expect 记失败类型：
//   缺了 tools_include 里的 tool，记 tool_miss。
//   写了 validate_ok 时，看最后一次 validateFields 的 ok 和 missing。
//   写了 locales 时，看 exportLocaleSnippet 入参里的 locale。
// publishCopy 没有 execute，停在待批准也算调到了。
async function runCase(c: Case) {
  const fails: FailKind[] = [];
  let stepCount = 0;

  try {
    const result = await generateText({
      model: resolveModel(),
      system: workbenchSystemPrompt,
      prompt: c.input,
      tools,
      // 单题最多 10 步，避免工具来回调用停不下来。
      stopWhen: stepCountIs(10),
      // 请求失败再试 1 次，不让一次网络错误停掉整卷。
      maxRetries: 1,
    });

    stepCount = result.steps.length;
    const steps = result.steps as StepLike[];
    // publishCopy 无 execute：可能停在待批准。toolCalls 里仍有这次调用，算调到了。
    const toolNames = collectToolNames(steps);
    const expectedTools = c.expect.tools_include ?? [];

    // 每个没出现的 tool 各记一条，所以一题可以有多条 tool_miss。
    for (const name of expectedTools) {
      if (!toolNames.has(name)) fails.push("tool_miss");
    }

    if (typeof c.expect.validate_ok === "boolean") {
      const validates = collectValidateResults(steps);
      // 只比最后一次 validateFields。没调到时 last 为空，同样记 validate_mismatch。
      // missing_fields 挂在这段里面：没写 validate_ok 的题不会查 missing。
      const last = validates[validates.length - 1];
      if (!last || last.ok !== c.expect.validate_ok)
        fails.push("validate_mismatch");
      if (c.expect.missing_fields?.length) {
        const missing = new Set(last?.missing ?? []);
        for (const field of c.expect.missing_fields) {
          if (!missing.has(field)) fails.push("missing_mismatch");
        }
      }
    }

    if (c.expect.locales?.length) {
      const locales = collectExportLocales(steps);
      for (const locale of c.expect.locales) {
        if (!locales.has(locale)) fails.push("locale_miss");
      }
    }
  } catch (err) {
    fails.push("error");
    console.error(
      ` [${c.id}] error:`,
      err instanceof Error ? err.message : err,
    );
  }

  return {
    id: c.id,
    category: c.category,
    stepCount,
    fails,
  };
}

async function main() {
  console.log(`Running ${cases.length} cases...\n`);

  const rows = [];
  for (const c of cases) {
    process.stdout.write(` [${c.id}] ${c.category}...`);
    const row = await runCase(c);
    rows.push(row);
    console.log(
      row.fails.length === 0 ? "PASS" : `FAIL ${row.fails.join(", ")}`,
    );
  }

  const total = rows.length;
  // 汇总分母只含写了对应 expect 字段的题。error 两种通过率都不算过。
  //   Tool choice accuracy  没有 tool_miss 的比例。
  //   Validation pass rate  没有 validate_mismatch、也没有 missing_mismatch 的比例。
  //   Avg steps             每题 steps.length 的平均。
  //   Failure distribution  每种失败标记的次数。一题多种失败会各算一次。
  const toolCases = rows.filter(
    (r) => cases.find((c) => c.id === r.id)?.expect.tools_include?.length,
  );
  const toolPass = toolCases.filter(
    (r) => !r.fails.includes("tool_miss") && !r.fails.includes("error"),
  ).length;

  const validateCases = rows.filter(
    (r) =>
      typeof cases.find((c) => c.id === r.id)?.expect.validate_ok === "boolean",
  );
  const validatePass = validateCases.filter(
    (r) =>
      !r.fails.includes("validate_mismatch") &&
      !r.fails.includes("missing_mismatch") &&
      !r.fails.includes("error"),
  ).length;

  const avgSteps =
    rows.reduce((sum, r) => sum + r.stepCount, 0) / Math.max(total, 1);

  // 按标记次数计，不是按失败题数。一题多种失败会各算一次。
  const failDist: Record<string, number> = {};
  for (const r of rows) {
    for (const f of r.fails) {
      failDist[f] = (failDist[f] ?? 0) + 1;
    }
  }

  console.log("\n=== Eval summary ===");
  console.log(
    `Tool choice accuracy: ${((toolPass / Math.max(toolCases.length, 1)) * 100).toFixed(1)}% (${toolPass}/${toolCases.length})`,
  );
  console.log(
    `Validation pass rate: ${((validatePass / Math.max(validateCases.length, 1)) * 100).toFixed(1)}% (${validatePass}/${validateCases.length})`,
  );
  console.log(`Avg steps: ${avgSteps.toFixed(1)}`);
  console.log(
    `Failure distribution: ${Object.keys(failDist).length ? JSON.stringify(failDist) : "none"}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
