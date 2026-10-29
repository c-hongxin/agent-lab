import { tool } from "ai";
import { z } from "zod";

// Fake publish. No execute — wait for UI approval, then addToolOutput.
export const publishCopy = tool({
  description:
    "Publish notification copy (demo only, no real publish). " +
    "Use when the user asks to publish.",
  inputSchema: z.object({
    title: z.string().describe("The title of the notification"),
    content: z.string().describe("The content of the notification"),
  }),
});

// Fake test email (no real send). Same HITL path: no execute until approval.
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
