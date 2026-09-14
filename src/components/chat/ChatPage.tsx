"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import Link from "next/link";
import { useState } from "react";

import { readViewportSize } from "@/lib/tools/client-tools";
import {
  fakePublishResult,
  fakeSendTestEmailResult,
} from "@/lib/tools/hitl-outputs";

import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

export function ChatPage() {
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);

  const {
    messages,
    sendMessage,
    addToolOutput,
    status,
    stop,
    error,
    regenerate,
    clearError,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === "getViewportSize") {
        addToolOutput({
          tool: "getViewportSize",
          toolCallId: toolCall.toolCallId,
          output: readViewportSize(),
        });
      }
    },
  });

  const isBusy = status === "streaming" || status === "submitted";

  function getMessageText(message: (typeof messages)[number]) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  }

  function editLastUserMessage() {
    const lastUserIndex = messages.findLastIndex(
      (message) => message.role === "user",
    );
    if (lastUserIndex === -1) {
      return;
    }

    const lastUser = messages[lastUserIndex];
    setInput(getMessageText(lastUser));
    setMessages(messages.slice(0, lastUserIndex));
    clearError();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">agent-lab · Demo A + B</h1>
        <p className="text-sm text-zinc-500">
          流式 Chat + Stop + 双 tool + HITL 写操作 + 通知预览卡
        </p>
        <p className="mt-1 text-sm">
          <Link href="/hitl" className="text-blue-600 hover:underline">
            HITL 独立练习页 →
          </Link>
        </p>
      </header>

      <MessageList
        messages={messages}
        stopped={stopped}
        onApproveWriteTool={({ toolName, toolCallId, input }) => {
          const record =
            input && typeof input === "object"
              ? (input as Record<string, unknown>)
              : {};

          if (toolName === "publishCopy") {
            void addToolOutput({
              tool: "publishCopy",
              toolCallId,
              output: fakePublishResult(String(record.title ?? "")),
            });
            return;
          }

          void addToolOutput({
            tool: "sendTestEmail",
            toolCallId,
            output: fakeSendTestEmailResult(
              String(record.to ?? ""),
              String(record.subject ?? ""),
            ),
          });
        }}
        onDenyWriteTool={({ toolName, toolCallId }) => {
          void addToolOutput({
            state: "output-error",
            tool: toolName,
            toolCallId,
            errorText:
              toolName === "publishCopy"
                ? "User denied the publish request."
                : "User denied sending the test email.",
          });
        }}
      />

      {error ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950">
          <p className="flex-1 text-red-600">请求失败：{error.message}</p>
          <button
            type="button"
            className="rounded-md bg-zinc-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
            onClick={editLastUserMessage}
          >
            编辑
          </button>
          <button
            type="button"
            disabled={isBusy}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            onClick={() => {
              clearError();
              void regenerate();
            }}
          >
            重新生成
          </button>
        </div>
      ) : null}

      <ChatInput
        input={input}
        isBusy={isBusy}
        onInputChange={setInput}
        onStop={() => {
          stop();
          setStopped(true);
        }}
        onSubmit={() => {
          const text = input.trim();
          if (!text || isBusy) {
            return;
          }
          sendMessage({ text });
          setInput("");
          setStopped(false);
        }}
      />
    </div>
  );
}
