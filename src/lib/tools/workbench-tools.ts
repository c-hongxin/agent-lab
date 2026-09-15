import { tool } from "ai";
import { z } from "zod";

import { listTriggers } from "@/lib/fixtures/triggers";

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
