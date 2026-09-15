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

export function WorkbenchChat() {
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/workbench",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

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
          先试：【有哪些通知类型？】应触发{" "}
          <code className="text-xs">listTriggerTypes</code>
        </p>
      </header>

      <MessageList messages={messages} stopped={stopped}></MessageList>

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
