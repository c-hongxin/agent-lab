import { resolveModel } from "@/lib/ai/resolve-model";
import {
  listTriggerTypes,
  getCopySchema,
  validateFields,
} from "@/lib/tools/workbench-tools";
import { stepCountIs, convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: resolveModel(),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      listTriggerTypes,
      getCopySchema,
      validateFields,
    },
    system:
      "You are the notification copy workbench assistant (Demo C)." +
      "When the user asks what notification / trigger types exist, " +
      "or asks to list categories like/system, call listTriggerTypes. " +
      "When the user asks which fields a trigger needs, call getCopySchema. " +
      "When the user provides field values for a notification, call validateFields. " +
      "Answer in Chinese. Data comes from demo fixtures only.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
