import { resolveModel } from "@/lib/ai/resolve-model";
import { workbenchSystemPrompt } from "@/lib/ai/workbench-system";
import {
  listTriggerTypes,
  getCopySchema,
  validateFields,
  exportLocaleSnippet,
} from "@/lib/tools/workbench-tools";
import { previewNotification } from "@/lib/tools/preview-tools";
import { stepCountIs, convertToModelMessages, streamText, UIMessage } from "ai";
import { publishCopy, sendTestEmail } from "@/lib/tools/write-tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: resolveModel(),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools: {
      listTriggerTypes,
      getCopySchema,
      validateFields,
      previewNotification,
      exportLocaleSnippet,
      publishCopy,
      sendTestEmail,
    },
    system: workbenchSystemPrompt,
    // 前端 stop() 会 abort 这次请求，服务端生成跟着停。
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
