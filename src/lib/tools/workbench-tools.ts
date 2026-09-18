import { tool } from "ai";
import { z } from "zod";

import { listTriggers } from "@/lib/fixtures/triggers";

import {
  copyFieldSchemas,
  getCopyFieldSchema,
  type TriggerTypeCode,
} from "@/copy-schema";

// 列出 fixtures 里的通知类型。可选 category 过滤（work / system / growth / social）。
export const listTriggerTypes = tool({
  description:
    "List available notification trigger types from demo fixtures." +
    "Use when the user asks what notification types exist, or before writing copy.",
  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe(
        "Optional category filter, e.g. work / system / growth / social",
      ),
  }),
  execute: async ({ category }) => {
    const triggers = listTriggers(category);
    return {
      trigger_types: triggers.map(({ code, description, category }) => ({
        code,
        description,
        category,
      })),
    };
  },
});

// 按 trigger_type_code 查 copy-schema，返回该类型要填的字段名。只覆盖已建 Zod 的 3 个 code。
export const getCopySchema = tool({
  description:
    "Get required copy fields for a trigger_type_code" +
    "Use when the user asks what fields are needed to write a notification, " +
    "or after choosing a trigger type.",
  inputSchema: z.object({
    trigger_type_code: z
      .string()
      .describe(
        "Trigger code, e.g. bounty_review_rejected / bounty_review_approved / announcement_published",
      ),
  }),
  execute: async ({ trigger_type_code }) => {
    const schema = getCopyFieldSchema(trigger_type_code as TriggerTypeCode);
    if (!schema) {
      return {
        ok: false as const,
        trigger_type_code,
        error: `Unknown or unsupported trigger_type_code: ${trigger_type_code}. Supported: ${Object.keys(copyFieldSchemas).join(", ")}`,
      };
    }
    const shape = schema.shape;
    const fields = Object.keys(shape).map((name) => ({
      name,
      required: true,
    }));
    return {
      ok: true as const,
      trigger_type_code,
      fields,
    };
  },
});

// 用对应 Zod schema 校验模型从用户话里抽出的字段。缺字段进 missing，格式不对进 errors。
export const validateFields = tool({
  description:
    "Validate notification field values against the Zod schema for a trigger_type_code" +
    "Use after the user provides design_name / reject_reason / etc., " +
    "or before generating copy.",
  inputSchema: z.object({
    trigger_type_code: z
      .string()
      .describe(
        "Trigger code, e.g. bounty_review_rejected / bounty_review_approved / announcement_published",
      ),
    fields: z
      .record(z.string(), z.unknown())
      .describe("Field values → value map extracted from the user message"),
  }),
  execute: async ({ trigger_type_code, fields }) => {
    const schema = getCopyFieldSchema(trigger_type_code as TriggerTypeCode);
    if (!schema) {
      return {
        ok: false as const,
        trigger_type_code,
        missing: [] as string[],
        errors: [
          `Unknown or unsupported trigger_type_code: ${trigger_type_code}`,
        ],
      };
    }

    const parsed = schema.safeParse(fields);
    if (parsed.success) {
      return {
        ok: true as const,
        trigger_type_code,
        missing: [] as string[],
        errors: [] as string[],
        values: parsed.data,
      };
    }

    const missing: string[] = [];
    const errors: string[] = [];
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "(root)";
      if (issue.code === "invalid_type" && issue.received === "undefined") {
        missing.push(key);
      } else {
        errors.push(`${key}: ${issue.message}`);
      }
    }

    return {
      ok: false as const,
      trigger_type_code,
      missing,
      errors,
    };
  },
});

// 把标题/正文打成可粘贴的 locale 片段。JSON.stringify 负责转义内容里的引号。
export const exportLocaleSnippet = tool({
  description:
    "Export a paste-ready locale snippet for notification copy" +
    "Use after preview, or when the user asks to export / 导出 locale / snippet.",
  inputSchema: z.object({
    trigger_type_code: z
      .string()
      .describe(
        "Trigger code, e.g. bounty_review_rejected / bounty_review_approved / announcement_published",
      ),
    locale: z.enum(["zh-CN", "en-US"]).describe("Target locale"),
    title: z.string().describe("Notification title in that locale"),
    content: z.string().describe("Notification content in that locale"),
    cta_text: z
      .string()
      .optional()
      .describe("CTA label; default depends on locale"),
  }),
  execute: async ({ trigger_type_code, locale, title, content, cta_text }) => {
    const cta = cta_text || (locale === "zh-CN" ? "查看详情" : "View details");
    const keyBase = trigger_type_code.replace(/_/g, ".");
    // JSON.stringify → 合法 JS/TS 双引号字面量（含内部 " 转义）
    const q = (s: string) => JSON.stringify(s);
    const snippet = [
      `// ${locale} · ${trigger_type_code}`,
      `"${keyBase}.title": ${q(title)},`,
      `"${keyBase}.content": ${q(content)},`,
      `"${keyBase}.cta": ${q(cta)},`,
    ].join("\n");

    return {
      ok: true as const,
      trigger_type_code,
      locale,
      snippet,
    };
  },
});
