"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import Link from "next/link";
import { useState } from "react";

const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

function fakeWeather() {
  return WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
}

export function HitlMiniChat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, addToolOutput, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/hitl",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isBusy = status === "streaming" || status === "submitted";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Demo A
          </Link>
        </p>
        <h1 className="text-xl font-semibold">HITL 最小示例</h1>
        <p className="text-sm text-zinc-500">
          问天气会触发 <code className="text-xs">getWeatherInformation</code>
          ；先批准/拒绝，才会补 tool result（AI SDK 5 等价于 cookbook 的
          needsApproval）。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-zinc-500">
            试试：「北京天气怎么样？」
          </p>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-8 rounded-2xl bg-blue-600 px-4 py-3 text-white"
                : "mr-8 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
            }
          >
            <p className="mb-1 text-xs font-medium opacity-70">
              {message.role === "user" ? "你" : "Assistant"}
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

              if (part.type !== "tool-getWeatherInformation") {
                return null;
              }

              const city =
                part.input &&
                typeof part.input === "object" &&
                "city" in part.input
                  ? String((part.input as { city?: string }).city ?? "")
                  : "";

              if (part.state === "input-available") {
                return (
                  <div
                    key={part.toolCallId}
                    className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950"
                  >
                    <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                      等待确认：查询 {city || "该城市"} 的天气？
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                        onClick={() => {
                          void addToolOutput({
                            tool: "getWeatherInformation",
                            toolCallId: part.toolCallId,
                            output: fakeWeather(),
                          });
                        }}
                      >
                        批准
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-600"
                        onClick={() => {
                          void addToolOutput({
                            state: "output-error",
                            tool: "getWeatherInformation",
                            toolCallId: part.toolCallId,
                            errorText: "User denied the weather request.",
                          });
                        }}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                );
              }

              if (part.state === "output-available") {
                return (
                  <p
                    key={part.toolCallId}
                    className="mt-2 text-sm text-emerald-700 dark:text-emerald-300"
                  >
                    天气（{city}）：{String(part.output)}
                  </p>
                );
              }

              if (part.state === "output-error") {
                return (
                  <p
                    key={part.toolCallId}
                    className="mt-2 text-sm text-red-600"
                  >
                    已拒绝：{part.errorText}
                  </p>
                );
              }

              return (
                <p key={part.toolCallId} className="mt-2 text-xs text-zinc-500">
                  tool 状态：{part.state}
                </p>
              );
            })}
          </div>
        ))}
      </div>

      {error ? (
        <p className="mb-2 text-sm text-red-600">请求失败：{error.message}</p>
      ) : null}

      <form
        className="flex gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700"
        onSubmit={(event) => {
          event.preventDefault();
          const text = input.trim();
          if (!text || isBusy) {
            return;
          }
          void sendMessage({ text });
          setInput("");
        }}
      >
        <input
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-900"
          placeholder="输入消息…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
