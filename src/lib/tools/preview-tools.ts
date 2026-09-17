import { tool } from "ai";
import { z } from "zod";

/*
Demo B Generative UI：返回通知预览用的结构化假数据
有 execute → 读操作，不需要人确认，直到出结果给前端画卡片 
 */
export const previewNotification = tool({
  description:
    "Preview a notification card after copy is ready. " +
    "Use when validation passed and draft title/content exist, " +
    "or when the user asks to preview / 预览",
  inputSchema: z.object({
    trigger_type_code: z.string().describe(" e.g. bounty_review_rejected"),
    title: z.string().describe("Notification title (zh-CN preferred)"),
    content: z.string().describe("Notification content"),
    cta_text: z
      .string()
      .optional()
      .describe("CTA button label; default 查看详情"),
    locale: z.string().optional().describe("e.g. zh-CN / en-US; default zh-CN"),
  }),
  execute: async ({ trigger_type_code, title, content, cta_text, locale }) => {
    return {
      trigger_type_code,
      title,
      content,
      cta_text: cta_text || "查看详情",
      locale: locale || "zh-CN",
    };
  },
});
