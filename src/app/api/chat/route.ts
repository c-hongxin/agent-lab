import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { resolveModel } from "@/lib/ai/resolve-model";
import { getViewportSizeSchema } from "@/lib/tools/client-tools";
import { previewNotification } from "@/lib/tools/preview-tools";
import { getWeather } from "@/lib/tools/server-tools";
import { publishCopy, sendTestEmail } from "@/lib/tools/write-tools";

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
      publishCopy,
      sendTestEmail,
      previewNotification,
    },
    system:
      "You are a helpful assistant in the agent-lab demo. " +
      "Use getWeather for weather questions and getViewportSize for screen size questions. " +
      "When the user asks to publish copy / 发布文案, call publishCopy. " +
      "When the user asks to send a test email / 试发邮件, call sendTestEmail. " +
      "When the user asks to preview a notification / 预览通知, call previewNotification. " +
      "If a tool execution is denied or fails because the user refused, " +
      "do not retry the same tool; tell the user the action was not performed.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
