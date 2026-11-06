"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import Link from "next/link";
import { useState } from "react";

import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";

export function McpLabChat() {
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/mcp-lab" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isBusy = status === "streaming" || status === "submitted";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Main chat
          </Link>
        </p>
        <h1 className="text-xl font-semibold">Phase 4 · MCP lab</h1>
        <p className="text-sm text-zinc-500">
          Read-only tool via MCP stdio server (
          <code className="text-xs">list_demo_triggers</code>). Demo C workbench
          stays on in-repo tools.
        </p>
      </header>

      <MessageList
        messages={messages}
        stopped={stopped}
        emptyHint='Try: "What notification trigger types are available?"'
      />

      {error ? (
        <p className="mb-2 text-sm text-red-600">
          Request failed: {error.message}
        </p>
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
