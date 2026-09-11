"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import Link from "next/link";
import { useState } from "react";

const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

function fakePublishResult(title: string) {
  return {
    ok: true,
    id: `copy_${Date.now()}`,
    title,
    publishedAt: new Date().toISOString(),
  };
}

function fakeSendTestEmailResult(to: string, subject: string) {
  return {
    ok: true,
    messageId: `msg_${Date.now()}`,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

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
            试试：「北京天气怎么样？」 /
            「发布文案：标题是测试标题，内容是测试内容」 /
            「试发邮件给 test@example.com，主题是问候，正文是你好」
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

              if (part.type === "tool-getWeatherInformation") {
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
                  <p
                    key={part.toolCallId}
                    className="mt-2 text-xs text-zinc-500"
                  >
                    tool 状态：{part.state}
                  </p>
                );
              }

              if (part.type === "tool-publishCopy") {
                const title =
                  part.input &&
                  typeof part.input === "object" &&
                  "title" in part.input
                    ? String((part.input as { title?: string }).title ?? "")
                    : "";
                const content =
                  part.input &&
                  typeof part.input === "object" &&
                  "content" in part.input
                    ? String((part.input as { content?: string }).content ?? "")
                    : "";

                if (part.state === "input-available") {
                  return (
                    <div
                      key={part.toolCallId}
                      className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950"
                    >
                      <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                        等待确认：发布文案？
                      </p>
                      <p className="mb-1 text-xs">标题： {title || "无"}</p>
                      <p className="mb-1 text-xs whitespace-pre-wrap">
                        内容： {content || "无"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                          onClick={() => {
                            void addToolOutput({
                              tool: "publishCopy",
                              toolCallId: part.toolCallId,
                              output: fakePublishResult(title),
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
                              tool: "publishCopy",
                              toolCallId: part.toolCallId,
                              errorText: "User denied the publish request.",
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
                      {JSON.stringify(part.output, null, 2)}
                    </p>
                  );
                }

                if (part.state === "output-error") {
                  return (
                    <p
                      key={part.toolCallId}
                      className="mt-2 text-sm text-red-600"
                    >
                      {part.errorText}
                    </p>
                  );
                }

                return (
                  <p
                    key={part.toolCallId}
                    className="mt-2 text-xs text-zinc-500"
                  >
                    tool 状态：{part.state}
                  </p>
                );
              }

              if (part.type === "tool-sendTestEmail") {
                const to =
                  part.input &&
                  typeof part.input === "object" &&
                  "to" in part.input
                    ? String((part.input as { to?: string }).to ?? "")
                    : "";
                const subject =
                  part.input &&
                  typeof part.input === "object" &&
                  "subject" in part.input
                    ? String((part.input as { subject?: string }).subject ?? "")
                    : "";
                const body =
                  part.input &&
                  typeof part.input === "object" &&
                  "body" in part.input
                    ? String((part.input as { body?: string }).body ?? "")
                    : "";

                if (part.state === "input-available") {
                  return (
                    <div
                      key={part.toolCallId}
                      className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950"
                    >
                      <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                        等待确认：试发邮件？
                      </p>
                      <p className="mb-1 text-xs">收件人：{to || "无"}</p>
                      <p className="mb-1 text-xs">主题：{subject || "无"}</p>
                      <p className="mb-2 text-xs whitespace-pre-wrap">
                        正文：{body || "无"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                          onClick={() => {
                            void addToolOutput({
                              tool: "sendTestEmail",
                              toolCallId: part.toolCallId,
                              output: fakeSendTestEmailResult(to, subject),
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
                              tool: "sendTestEmail",
                              toolCallId: part.toolCallId,
                              errorText: "User denied sending the test email.",
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
                      {JSON.stringify(part.output, null, 2)}
                    </p>
                  );
                }

                if (part.state === "output-error") {
                  return (
                    <p
                      key={part.toolCallId}
                      className="mt-2 text-sm text-red-600"
                    >
                      {part.errorText}
                    </p>
                  );
                }

                return (
                  <p
                    key={part.toolCallId}
                    className="mt-2 text-xs text-zinc-500"
                  >
                    tool 状态：{part.state}
                  </p>
                );
              }

              return null;
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
