import { resolveModel } from "@/lib/ai/resolve-model";
import { workbenchSystemPrompt } from "@/lib/ai/workbench-system";
import { previewNotification } from "@/lib/tools/preview-tools";
import {
  exportLocaleSnippet,
  getCopySchema,
  listTriggerTypes,
  validateFields,
} from "@/lib/tools/workbench-tools";
import { publishCopy, sendTestEmail } from "@/lib/tools/write-tools";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";

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
    // 与 pnpm eval 一致。不设的话走 DeepSeek 默认采样，同一句会换工具。
    temperature: 0,
  });

  return result.toUIMessageStreamResponse();
}
