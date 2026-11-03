import { tool } from "ai";
import { z } from "zod";

// 假发布。无 execute——等 UI 批准后再 addToolOutput。
export const publishCopy = tool({
  description:
    "Publish notification copy (demo only, no real publish). " +
    "Use when the user asks to publish.",
  inputSchema: z.object({
    title: z.string().describe("The title of the notification"),
    content: z.string().describe("The content of the notification"),
  }),
});

// 假试发邮件（不真发）。同一套 HITL：批准前无 execute。
export const sendTestEmail = tool({
  description:
    "Send a test email (demo only, no real email). " +
    "Use when the user asks to send a test email.",
  inputSchema: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
  }),
});
