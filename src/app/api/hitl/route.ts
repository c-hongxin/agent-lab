import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { resolveModel } from "@/lib/ai/resolve-model";

import { publishCopy } from "@/lib/tools/write-tools";

export const maxDuration = 30;

/**
 * Demo B · 官方 HITL 最小示例（独立路由）
 *
 * 当前依赖是 AI SDK 5，没有 cookbook 里的 `needsApproval`（属 AI SDK 6+）。
 * 等价做法：tool **不写 execute** → 模型发出调用后停在 input-available，
 * 前端批准后再 `addToolOutput`，拒绝则 `output-error`。
 */
const getWeatherInformation = tool({
  description: "Show the weather in a given city to the user (HITL demo)",
  inputSchema: z.object({
    city: z.string().describe("City name, e.g. Beijing"),
  }),
  // 故意不写 execute：等人确认后再由客户端补 result
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: resolveModel(),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: { getWeatherInformation, publishCopy },
    system:
      "You are a helpful assistant for the HITL mini demo. " +
      "When the user asks about weather, call getWeatherInformation. " +
      "When the user asks to publish a notification, call publishCopy with title and content. " +
      "If a tool execution is denied or fails because the user refused, " +
      "do not retry the same tool; tell the user the action was not performed.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
