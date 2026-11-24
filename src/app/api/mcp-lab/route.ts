import { createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { join } from "node:path";

import { resolveModel } from "@/lib/ai/resolve-model";
import z from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const serverPath = join(process.cwd(), "mcp", "demo-triggers-server.ts");

  // Windows 友好：用 pnpm exec tsx 在 Node 下跑 .ts MCP server
  const mcpClient = await createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      command: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      args: ["exec", "tsx", serverPath],
    }),
  });

  try {
    // ai@5 + @ai-sdk/mcp：自动 JSON Schema 校验会对不上（value is not a function）
    // 显式传入 Zod schema，并把 toModelOutput 改成 ai@5 的位置参数签名
    const rawTools = await mcpClient.tools({
      schemas: {
        list_demo_triggers: {
          inputSchema: z.object({
            category: z
              .string()
              .optional()
              .describe("Optional category filter, e.g. work"),
          }),
        },
      },
    });

    const mcpTools = Object.fromEntries(
      Object.entries(rawTools).map(([name, tool]) => [
        name,
        {
          ...tool,
          // MCP 返回 content 块；改成 ai@5 要的 { type: "text", value }。
          toModelOutput: (output: unknown) => {
            const result = output as {
              content?: Array<{ type: string; text?: string }>;
            } | null;
            if (result && Array.isArray(result.content)) {
              const text = result.content
                .filter((p) => p.type === "text" && typeof p.text === "string")
                .map((p) => p.text)
                .join("\n");
              return {
                type: "text" as const,
                value: text || JSON.stringify(result),
              };
            }
            return { type: "text" as const, value: (output as object) ?? null };
          },
        },
      ]),
    ) as Parameters<typeof streamText>[0]["tools"];

    const result = streamText({
      model: resolveModel(),
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools: mcpTools,
      system:
        "You are the MCP lab assistant for agent-lab. " +
        "When the user asks what notification / trigger types exist, " +
        "call list_demo_triggers (from the MCP server). " +
        "Answer in English. Data is demo fixtures only.",
      // 前端 stop() 会 abort 这次请求，服务端生成跟着停。
      abortSignal: req.signal,
      onFinish: async () => {
        // stdio 子进程要显式关掉，否则请求结束后 tsx 还挂着。
        await mcpClient.close();
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    await mcpClient.close();
    throw error;
  }
}
