"use client";

import type { UIMessage } from "ai";

import { MessageItem } from "./MessageItem";

export function MessageList({
  messages,
  stopped,
  emptyHint = "试试：「北京天气怎么样？」/「我屏幕多宽？」/「发布文案…」/「预览通知…」",
  onApproveWriteTool,
  onDenyWriteTool,
}: {
  messages: UIMessage[];
  stopped: boolean;
  emptyHint?: string;
  onApproveWriteTool?: (args: {
    toolName: "publishCopy" | "sendTestEmail";
    toolCallId: string;
    input: unknown;
  }) => void;
  onDenyWriteTool?: (args: {
    toolName: "publishCopy" | "sendTestEmail";
    toolCallId: string;
  }) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-zinc-500">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onApproveWriteTool={onApproveWriteTool}
          onDenyWriteTool={onDenyWriteTool}
        />
      ))}
      {stopped ? (
        <p className="text-sm text-zinc-500">模型停止了，无法继续生成内容。</p>
      ) : null}
    </div>
  );
}
