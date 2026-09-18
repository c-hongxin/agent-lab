import { resolveModel } from "@/lib/ai/resolve-model";
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
    system:
      "You are the notification copy workbench assistant (Demo C). " +
      "When the user asks what notification / trigger types exist, " +
      "or asks to list categories like work/system, call listTriggerTypes. " +
      "When the user asks which fields a trigger needs, call getCopySchema. " +
      "When the user provides field values for a notification, call validateFields. " +
      "After validateFields ok:true, draft zh-CN title and body, then call previewNotification. " +
      "After preview, or when the user asks to export locale / snippet, " +
      "call exportLocaleSnippet for zh-CN and en-US. " +
      "When the user asks to publish / 发布, call publishCopy. " +
      "When the user asks to send a test email / 试发邮件, call sendTestEmail. " +
      "If a write tool is denied, do not retry it. " +
      "Answer in Chinese. Data comes from demo fixtures only.",
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
