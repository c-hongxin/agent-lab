"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import Link from "next/link";
import { MessageList } from "../chat/MessageList";
import { useState } from "react";
import { ChatInput } from "../chat/ChatInput";
import {
  fakePublishResult,
  fakeSendTestEmailResult,
} from "@/lib/tools/hitl-outputs";

export function WorkbenchChat() {
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);

  const { messages, sendMessage, status, stop, error, addToolOutput } = useChat(
    {
      transport: new DefaultChatTransport({
        api: "/api/workbench",
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    },
  );

  const isBusy = status === "streaming" || status === "submitted";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 主 Chat
          </Link>
        </p>
        <h1 className="text-xl font-semibold">Demo C · 通知文案工作台</h1>
        <p className="text-sm text-zinc-500">
          查类型 → 校验字段 → 生成文案 → 预览 → 导出 locale。发布 / 试发需确认。
        </p>
      </header>

      <MessageList
        messages={messages}
        stopped={stopped}
        emptyHint="试试：帮我写赏金驳回通知，设计名是桌面收纳盒，原因是刀路不清晰。写完预览并导出 locale。"
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
                ? "User denied publishing the copy."
                : "User denied sending the test email.",
          });
        }}
      ></MessageList>

      {error ? (
        <p className="mb-2 text-sm text-red-600">请求失败：{error.message}</p>
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
          if (!text || isBusy) return;
          void sendMessage({ text });
          setInput("");
          setStopped(false);
        }}
      />
    </div>
  );
}
