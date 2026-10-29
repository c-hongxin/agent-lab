"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import Link from "next/link";
import { useState } from "react";

import { ApprovalCard } from "@/components/chat/ApprovalCard";
import { NotificationPreviewCard } from "@/components/chat/NotificationPreviewCard";
import {
  fakePublishResult,
  fakeSendTestEmailResult,
  fakeWeather,
} from "@/lib/tools/hitl-outputs";

export function HitlMiniChat() {
  const [input, setInput] = useState("");

  const {
    messages,
    sendMessage,
    addToolOutput,
    status,
    error,
    regenerate,
    clearError,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/hitl",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
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
      <header className="mb-4 space-y-1">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Main chat (Demo A + B)
          </Link>
        </p>
        <h1 className="text-xl font-semibold">HITL mini demo</h1>
        <p className="text-sm text-zinc-500">
          Write ops use <code className="text-xs">ApprovalCard</code>; preview
          uses Generative UI. Main chat already has the same flow; this page is
          for HITL practice only.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-zinc-500">
            Try: &quot;How is the weather in Beijing?&quot; / &quot;Publish
            copy: title Test, content Hello&quot; / &quot;Send a test email to
            test@example.com, subject Greeting, body Hello&quot; / &quot;Preview
            notification: trigger type bounty_awarded&quot;
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
              {message.role === "user" ? "You" : "Assistant"}
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
                    <ApprovalCard
                      key={part.toolCallId}
                      title={`Look up weather for ${city || "this city"}?`}
                      onApprove={() => {
                        void addToolOutput({
                          tool: "getWeatherInformation",
                          toolCallId: part.toolCallId,
                          output: fakeWeather(),
                        });
                      }}
                      onDeny={() => {
                        void addToolOutput({
                          state: "output-error",
                          tool: "getWeatherInformation",
                          toolCallId: part.toolCallId,
                          errorText: "User denied the weather request.",
                        });
                      }}
                    />
                  );
                }

                if (part.state === "output-available") {
                  return (
                    <p
                      key={part.toolCallId}
                      className="mt-2 text-sm text-emerald-700 dark:text-emerald-300"
                    >
                      Weather ({city}): {String(part.output)}
                    </p>
                  );
                }

                if (part.state === "output-error") {
                  return (
                    <p
                      key={part.toolCallId}
                      className="mt-2 text-sm text-red-600"
                    >
                      Denied: {part.errorText}
                    </p>
                  );
                }

                return (
                  <p
                    key={part.toolCallId}
                    className="mt-2 text-xs text-zinc-500"
                  >
                    Tool state: {part.state}
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
                    <ApprovalCard
                      key={part.toolCallId}
                      title="Approve publish copy?"
                      onApprove={() => {
                        void addToolOutput({
                          tool: "publishCopy",
                          toolCallId: part.toolCallId,
                          output: fakePublishResult(title),
                        });
                      }}
                      onDeny={() => {
                        void addToolOutput({
                          state: "output-error",
                          tool: "publishCopy",
                          toolCallId: part.toolCallId,
                          errorText: "User denied the publish request.",
                        });
                      }}
                    >
                      <p>Title: {title || "(none)"}</p>
                      <p className="whitespace-pre-wrap">
                        Content: {content || "(none)"}
                      </p>
                    </ApprovalCard>
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
                    Tool state: {part.state}
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
                    <ApprovalCard
                      key={part.toolCallId}
                      title="Approve sending test email?"
                      onApprove={() => {
                        void addToolOutput({
                          tool: "sendTestEmail",
                          toolCallId: part.toolCallId,
                          output: fakeSendTestEmailResult(to, subject),
                        });
                      }}
                      onDeny={() => {
                        void addToolOutput({
                          state: "output-error",
                          tool: "sendTestEmail",
                          toolCallId: part.toolCallId,
                          errorText: "User denied sending the test email.",
                        });
                      }}
                    >
                      <p>To: {to || "(none)"}</p>
                      <p>Subject: {subject || "(none)"}</p>
                      <p className="whitespace-pre-wrap">
                        Body: {body || "(none)"}
                      </p>
                    </ApprovalCard>
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
                    Tool state: {part.state}
                  </p>
                );
              }

              if (part.type === "tool-previewNotification") {
                if (part.state === "output-available" && part.output !== null) {
                  const data = part.output as {
                    trigger_type_code: string;
                    title: string;
                    content: string;
                    cta_text: string;
                    locale: string;
                  };
                  return (
                    <NotificationPreviewCard key={part.toolCallId} {...data} />
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
                    Tool state: {part.state}
                  </p>
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950">
          <p className="flex-1">Request failed: {error.message}</p>
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
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            onClick={() => {
              clearError();
              void regenerate();
            }}
          >
            Regenerate
          </button>
        </div>
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
          placeholder="Type a message…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
