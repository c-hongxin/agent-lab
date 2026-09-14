import { tool } from "ai";
import { z } from "zod";

/*
Demo B Generative UI：返回通知预览用的结构化假数据
有 execute → 读操作，不需要人确认，直到出结果给前端画卡片 
 */
export const previewNotification = tool({
  description:
    "Preview notification data for Generative UI (demo only). " +
    "Use when the user asks to preview a notification.",
  inputSchema: z.object({
    trigger_type_code: z
      .string()
      .describe(
        "The trigger type code of the notification, e.g. bounty_awarded",
      ),
  }),
  execute: async ({ trigger_type_code }) => {
    return {
      trigger_type_code,
      title: "通知标题",
      content: "通知内容",
      cta_text: "查看详情",
      locale: "zh-CN",
    };
  },
});
