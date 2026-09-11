import { tool } from "ai";
import { z } from "zod";

/* Demo B 写操作：模拟“发布文案”
故意不写 execute → 必须等人确认后，前端再 addToolOutput */
export const publishCopy = tool({
  description:
    "Publish notification copy (demo only, no real publish). " +
    "Use when the user asks to publish or 发布文案.",
  inputSchema: z.object({
    title: z.string().describe("The title of the notification"),
    content: z.string().describe("The content of the notification"),
  }),
});
