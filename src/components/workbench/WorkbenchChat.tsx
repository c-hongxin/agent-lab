"use client";

import {
  fakePublishResult,
  fakeSendTestEmailResult,
} from "@/lib/tools/hitl-outputs";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  UIMessage,
} from "ai";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "../chat/ChatInput";
import { MessageList } from "../chat/MessageList";

export function WorkbenchChat() {
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    addToolOutput,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/workbench",
    }),
    // 服务端 tool 跑完后自动续轮，让模型接着预览 / 导出。
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isBusy = status === "streaming" || status === "submitted";

  // 会话 id 放 ref。effect 里同步 setState 会触发 set-state-in-effect。
  const sessionIdRef = useRef<string | null>(null);
  // GET 完成前不要保存，否则会用空数组覆盖服务端已有消息。
  const loaded = useRef(false);

  // 进页：沿用地址栏 ?session=，没有就生成写回，再按这个 id 拉历史
  useEffect(() => {
    const url = new URL(window.location.href);
    let id = url.searchParams.get("session")?.trim();
    if (!id) {
      id = crypto.randomUUID();
      url.searchParams.set("session", id);
      // replaceState 不新增历史记录，刷新仍停在同一条会话。
      window.history.replaceState(null, "", url);
    }
    sessionIdRef.current = id;

    void fetch(`/api/workbench/session?id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data: { messages?: UIMessage[] }) => {
        // 空数组不 setMessages，避免盖掉用户已经发出的第一句。
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .finally(() => {
        loaded.current = true;
      });
  }, [setMessages]);

  // messages 一变就写回内存表。loaded 是 ref，放进依赖也不会因此重跑。
  useEffect(() => {
    const id = sessionIdRef.current;
    if (!loaded.current || !id) return;
    void fetch("/api/workbench/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, messages }),
    });
  }, [messages]);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Main chat
          </Link>
        </p>
        <h1 className="text-xl font-semibold">
          Demo C · Notification copy workbench
        </h1>
        <p className="text-sm text-zinc-500">
          List types → validate fields → draft copy → preview → export locale.
          Publish / test email require approval.
        </p>
      </header>

      <MessageList
        messages={messages}
        stopped={stopped}
        emptyHint="Try: Write a bounty rejection notice. Design name is Desktop Organizer Box, reason is unclear toolpath. Preview and export locale."
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
          // 拒绝也要回填 output-error，模型才知道不要当成没调用。
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
          // 停完 status 会回到 ready，文案靠这个本地标记。
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
