import { tool } from "ai";
import { z } from "zod";

// 模拟发布文案。不写 execute，等人在确认卡点同意后，前端再 addToolOutput。
export const publishCopy = tool({
  description:
    "Publish notification copy (demo only, no real publish). " +
    "Use when the user asks to publish or 发布文案.",
  inputSchema: z.object({
    title: z.string().describe("The title of the notification"),
    content: z.string().describe("The content of the notification"),
  }),
});

// 模拟试发邮件，不真发信。同样没有 execute，走同一套确认卡。
export const sendTestEmail = tool({
  description:
    "Send a test email (demo only, no real email). " +
    "Use when the user asks to send a test email or 试发邮件.",
  inputSchema: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
  }),
});
