import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { resolveModel } from "@/lib/ai/resolve-model";

import { publishCopy, sendTestEmail } from "@/lib/tools/write-tools";
import { previewNotification } from "@/lib/tools/preview-tools";

export const maxDuration = 30;

/**
 * Demo B HITL mini demo (standalone route).
 *
 * AI SDK 5 has no cookbook `needsApproval` (that is 6+).
 * Equivalent: tool without execute → stops at input-available →
 * client addToolOutput on approve, or output-error on deny.
 */
const getWeatherInformation = tool({
  description: "Show the weather in a given city to the user (HITL demo)",
  inputSchema: z.object({
    city: z.string().describe("City name, e.g. Beijing"),
  }),
  // No execute on purpose: client supplies result after approval
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: resolveModel(),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      getWeatherInformation,
      publishCopy,
      sendTestEmail,
      previewNotification,
    },
    system:
      "You are a helpful assistant for the HITL mini demo. " +
      "When the user asks about weather, call getWeatherInformation. " +
      "When the user asks to publish a notification, call publishCopy with title and content. " +
      "When the user asks to send a test email, call sendTestEmail with to, subject, and body. " +
      "When the user asks to preview a notification, call previewNotification with trigger_type_code. " +
      "If a tool execution is denied or fails because the user refused, " +
      "do not retry the same tool; tell the user the action was not performed. " +
      "Answer in English.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
