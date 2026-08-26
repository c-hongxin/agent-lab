"use client";

import type { UIMessage } from "ai";

import { ToolCallCard } from "./ToolCallCard";

export function MessageItem({ message }: { message: UIMessage }) {
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

        if (part.type.startsWith("tool-")) {
          return (
            <ToolCallCard
              key={`${message.id}-tool-${index}`}
              part={part as Extract<typeof part, { type: `tool-${string}` }>}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
