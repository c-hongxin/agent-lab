// 阶段 4：对 Demo C 工作台 tools 跑 evals/cases.json
// 用法：pnpm eval

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateText, stepCountIs } from "ai";

import { resolveModel } from "../src/lib/ai/resolve-model";
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
const cases = JSON.parse(
  readFileSync(join(__dirname, "cases.json"), "utf8"),
) as Case[];

const SYSTEM =
  "You are the notification copy workbench assistant (Demo C). " +
  "When the user asks what notification / trigger types exist, " +
  "or asks to list categories like work/system, call listTriggerTypes. " +
  "When the user asks which fields a trigger needs, call getCopySchema. " +
  "When the user provides field values for a notification, call validateFields. " +
  "After validateFields ok:true, draft zh-CN title and body, then call previewNotification. " +
  "After preview, or when the user asks to export locale / snippet, " +
  "call exportLocaleSnippet for zh-CN and en-US. " +
  "When the user asks to publish / 发布, call publishCopy. " +
  "When the user asks to send a test email / 试发邮件, call sendTestEmail. " +
  "If a write tool is denied, do not retry it. " +
  "Answer in Chinese. Data comes from demo fixtures only.";

const tools = {
  listTriggerTypes,
  getCopySchema,
  validateFields,
  previewNotification,
  exportLocaleSnippet,
  publishCopy,
  sendTestEmail,
};

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

async function runCase(c: Case) {
  const fails: FailKind[] = [];
  let stepCount = 0;

  try {
    const result = await generateText({
      model: resolveModel(),
      system: SYSTEM,
      prompt: c.input,
      tools,
      stopWhen: stepCountIs(10),
      // publishCopy 无 execute：允许停在待确认，仍能统计 toolCalls
      maxRetries: 1,
    });

    stepCount = result.steps.length;
    const steps = result.steps as StepLike[];
    const toolNames = collectToolNames(steps);
    const expectedTools = c.expect.tools_include ?? [];

    for (const name of expectedTools) {
      if (!toolNames.has(name)) fails.push("tool_miss");
    }

    if (typeof c.expect.validate_ok === "boolean") {
      const validates = collectValidateResults(steps);
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

  const failDist: Record<string, number> = {};
  for (const r of rows) {
    for (const f of r.fails) {
      failDist[f] = (failDist[f] ?? 0) + 1;
    }
  }

  console.log("\n=== Eval summary ===");
  console.log(
    `工具选对率：${((toolPass / Math.max(toolCases.length, 1)) * 100).toFixed(1)}% (${toolPass}/${toolCases.length})`,
  );
  console.log(
    `验证通过率：${((validatePass / Math.max(validateCases.length, 1)) * 100).toFixed(1)}% (${validatePass}/${validateCases.length})`,
  );
  console.log(`平均对话步数：${avgSteps.toFixed(1)}`);
  console.log(
    `失败类型分布：${Object.keys(failDist).length ? JSON.stringify(failDist) : "无"}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
