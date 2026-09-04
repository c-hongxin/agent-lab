import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { getWeather } from "@/lib/tools/server-tools";
import { getViewportSizeSchema } from "@/lib/tools/client-tools";

export const maxDuration = 30;

function resolveModel() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing DEEPSEEK_API_KEY. Copy .env.example to .env.local and fill it in.",
    );
  }

  const deepseek = createOpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
  });

  const modelId = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
  // DeepSeek 的 OpenAI 兼容层用 Chat Completions；默认 openai() 会打 /v1/responses，
  // 多轮带 tool-result 时会 400：No tool call found for tool output with call_id …
  return deepseek.chat(modelId);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: resolveModel(),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      getWeather,
      getViewportSize: {
        description:
          "Get the browser viewport width and height in pixels. Use when the user asks about screen or window size.",
        inputSchema: getViewportSizeSchema,
      },
    },
    system:
      "You are a helpful assistant in the agent-lab demo. " +
      "Use getWeather for weather questions and getViewportSize for screen size questions.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
