import { resolveModel } from "@/lib/ai/resolve-model";
import { listTriggerTypes } from "@/lib/tools/workbench-tools";
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
    },
    system:
      "You are the notification copy workbench assistant (Demo C)." +
      "When the user asks what notification / trigger types exist, " +
      "or asks to list categories like/system, call listTriggerTypes. " +
      "Answer in Chinese. Data comes from demo fixtures only.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
