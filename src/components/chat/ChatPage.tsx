'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useState } from 'react';

import { readViewportSize } from '@/lib/tools/client-tools';

import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatPage() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, addToolOutput, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === 'getViewportSize') {
        addToolOutput({
          tool: 'getViewportSize',
          toolCallId: toolCall.toolCallId,
          output: readViewportSize(),
        });
      }
    },
  });

  const isBusy = status === 'streaming' || status === 'submitted';

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">agent-lab · Demo A</h1>
        <p className="text-sm text-zinc-500">
          流式 Chat + 服务端 getWeather + 客户端 getViewportSize
        </p>
      </header>

      <MessageList messages={messages} />

      <ChatInput
        input={input}
        isBusy={isBusy}
        onInputChange={setInput}
        onStop={() => stop()}
        onSubmit={() => {
          const text = input.trim();
          if (!text || isBusy) {
            return;
          }
          sendMessage({ text });
          setInput('');
        }}
      />
    </div>
  );
}
