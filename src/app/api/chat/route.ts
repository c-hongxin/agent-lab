import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { resolveModel } from "@/lib/ai/resolve-model";
import { getViewportSizeSchema } from "@/lib/tools/client-tools";
import { getWeather } from "@/lib/tools/server-tools";

export const maxDuration = 30;

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
