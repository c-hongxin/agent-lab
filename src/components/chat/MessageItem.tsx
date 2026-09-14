"use client";

import type { UIMessage } from "ai";

import { ApprovalCard } from "./ApprovalCard";
import { NotificationPreviewCard } from "./NotificationPreviewCard";
import { ToolCallCard } from "./ToolCallCard";

type ToolPart = Extract<UIMessage["parts"][number], { type: `tool-${string}` }>;

type MessageItemProps = {
  message: UIMessage;
  onApproveWriteTool?: (args: {
    toolName: "publishCopy" | "sendTestEmail";
    toolCallId: string;
    input: unknown;
  }) => void;
  onDenyWriteTool?: (args: {
    toolName: "publishCopy" | "sendTestEmail";
    toolCallId: string;
  }) => void;
};

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object"
    ? (input as Record<string, unknown>)
    : {};
}

function renderWriteApproval(
  part: ToolPart,
  toolName: "publishCopy" | "sendTestEmail",
  onApproveWriteTool?: MessageItemProps["onApproveWriteTool"],
  onDenyWriteTool?: MessageItemProps["onDenyWriteTool"],
) {
  if (part.state !== "input-available") {
    return null;
  }

  const input = asRecord(part.input);

  if (toolName === "publishCopy") {
    const title = String(input.title ?? "");
    const content = String(input.content ?? "");
    return (
      <ApprovalCard
        key={part.toolCallId}
        title="等待确认：发布文案？"
        onApprove={() =>
          onApproveWriteTool?.({
            toolName,
            toolCallId: part.toolCallId,
            input,
          })
        }
        onDeny={() =>
          onDenyWriteTool?.({ toolName, toolCallId: part.toolCallId })
        }
      >
        <p>标题：{title || "无"}</p>
        <p className="whitespace-pre-wrap">内容：{content || "无"}</p>
      </ApprovalCard>
    );
  }

  const to = String(input.to ?? "");
  const subject = String(input.subject ?? "");
  const body = String(input.body ?? "");
  return (
    <ApprovalCard
      key={part.toolCallId}
      title="等待确认：试发邮件？"
      onApprove={() =>
        onApproveWriteTool?.({
          toolName,
          toolCallId: part.toolCallId,
          input,
        })
      }
      onDeny={() =>
        onDenyWriteTool?.({ toolName, toolCallId: part.toolCallId })
      }
    >
      <p>收件人：{to || "无"}</p>
      <p>主题：{subject || "无"}</p>
      <p className="whitespace-pre-wrap">正文：{body || "无"}</p>
    </ApprovalCard>
  );
}

export function MessageItem({
  message,
  onApproveWriteTool,
  onDenyWriteTool,
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={
        isUser
          ? "ml-8 rounded-2xl bg-blue-600 px-4 py-3 text-white"
          : "mr-8 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
      }
    >
      <p className="mb-1 text-xs font-medium opacity-70">
        {isUser ? "你" : "Assistant"}
      </p>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <p
              key={`${message.id}-text-${index}`}
              className="whitespace-pre-wrap"
            >
              {part.text}
            </p>
          );
        }

        if (part.type === "tool-publishCopy") {
          const approval = renderWriteApproval(
            part,
            "publishCopy",
            onApproveWriteTool,
            onDenyWriteTool,
          );
          if (approval) {
            return approval;
          }
        }

        if (part.type === "tool-sendTestEmail") {
          const approval = renderWriteApproval(
            part,
            "sendTestEmail",
            onApproveWriteTool,
            onDenyWriteTool,
          );
          if (approval) {
            return approval;
          }
        }

        if (
          part.type === "tool-previewNotification" &&
          part.state === "output-available" &&
          part.output != null
        ) {
          const data = part.output as {
            trigger_type_code: string;
            title: string;
            content: string;
            cta_text: string;
            locale: string;
          };
          return <NotificationPreviewCard key={part.toolCallId} {...data} />;
        }

        if (part.type.startsWith("tool-")) {
          return (
            <ToolCallCard
              key={`${message.id}-tool-${index}`}
              part={part as ToolPart}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
