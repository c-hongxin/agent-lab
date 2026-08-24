import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { getWeather } from '@/lib/tools/server-tools';
import { getViewportSizeSchema } from '@/lib/tools/client-tools';

export const maxDuration = 30;

function resolveModel() {
  const modelId = process.env.OPENAI_MODEL ?? 'gpt-4o';
  return openai(modelId);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: resolveModel(),
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools: {
      getWeather,
      getViewportSize: {
        description:
          'Get the browser viewport width and height in pixels. Use when the user asks about screen or window size.',
        inputSchema: getViewportSizeSchema,
      },
    },
    system:
      'You are a helpful assistant in the agent-lab demo. ' +
      'Use getWeather for weather questions and getViewportSize for screen size questions.',
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
