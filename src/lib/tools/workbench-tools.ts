import { tool } from "ai";
import { z } from "zod";

import { listTriggers } from "@/lib/fixtures/triggers";

import {
  copyFieldSchemas,
  getCopyFieldSchema,
  type TriggerTypeCode,
} from "@/copy-schema";

// Demo C：列出自造 trigger 类型
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

export const validateFields = tool({
  description:
    "Validate notification field values against the Zod schema for a trigger_type_code" +
    "Use after the user provides design_name / rejection_reason / etc., " +
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
