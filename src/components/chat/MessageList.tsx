"use client";

import type { UIMessage } from "ai";

import { MessageItem } from "./MessageItem";

export function MessageList({
  messages,
  stopped,
  emptyHint = 'Try: "How is the weather in Beijing?" / "How wide is my screen?" / "Publish copy…" / "Preview notification…"',
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
        <p className="text-sm text-zinc-500">Generation stopped.</p>
      ) : null}
    </div>
  );
}
