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
    // 客户端 tool 回填后自动再请求一轮，否则模型拿不到 tool-result 就停住。
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      // dynamic tool 没有固定 schema，这里不代执行。
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
    // 丢掉这条用户消息及其后的回复，方便改字重发。
    setMessages(messages.slice(0, lastUserIndex));
    clearError();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">agent-lab · Demo A + B</h1>
        <p className="text-sm text-zinc-500">
          Streaming chat + Stop + dual tools + HITL writes + notification preview
        </p>
        <p className="mt-1 text-sm">
          <Link href="/hitl" className="text-blue-600 hover:underline">
            HITL practice page →
          </Link>
        </p>
        <p className="mt-1 text-sm">
          <Link href="/workbench" className="text-blue-600 hover:underline">
            Demo C · Workbench →
          </Link>
        </p>
        <p className="mt-1 text-sm">
          <Link href="/mcp-lab" className="text-blue-600 hover:underline">
            Phase 4 · MCP lab →
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
          // 拒绝也要回填结果，否则协议上仍是「有 tool-call、无 result」。
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
          <p className="flex-1 text-red-600">Request failed: {error.message}</p>
          <button
            type="button"
            className="rounded-md bg-zinc-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
            onClick={editLastUserMessage}
          >
            Edit
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
            Regenerate
          </button>
        </div>
      ) : null}

      <ChatInput
        input={input}
        isBusy={isBusy}
        onInputChange={setInput}
        onStop={() => {
          stop();
          // useChat 的 status 停完会回到 ready，本地 flag 才用来显示 “Generation stopped.”。
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
