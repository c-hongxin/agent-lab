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
