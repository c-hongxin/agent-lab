import { tool } from "ai";
import { z } from "zod";

// Return preview-card payload. Has execute; UI renders NotificationPreviewCard without approval.
export const previewNotification = tool({
  description:
    "Preview a notification card after copy is ready. " +
    "Use when validation passed and draft title/content exist, " +
    "or when the user asks to preview",
  inputSchema: z.object({
    trigger_type_code: z.string().describe(" e.g. bounty_review_rejected"),
    title: z.string().describe("Notification title (zh-CN preferred)"),
    content: z.string().describe("Notification content"),
    cta_text: z
      .string()
      .optional()
      .describe("CTA button label; default 'View details'"),
    locale: z.string().optional().describe("e.g. zh-CN / en-US; default zh-CN"),
  }),
  execute: async ({ trigger_type_code, title, content, cta_text, locale }) => {
    return {
      trigger_type_code,
      title,
      content,
      cta_text: cta_text || "View details",
      locale: locale || "zh-CN",
    };
  },
});
