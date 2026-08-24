'use client';

import type { UIMessage } from 'ai';

type ToolPart = Extract<
  UIMessage['parts'][number],
  { type: `tool-${string}` }
>;

const STATE_LABEL: Record<string, string> = {
  'input-streaming': '参数生成中…',
  'input-available': '等待执行…',
  'output-available': '已完成',
  'output-error': '执行失败',
  'output-denied': '已拒绝',
  'approval-requested': '等待确认',
  'approval-responded': '已响应确认',
};

function formatToolName(partType: string) {
  return partType.replace(/^tool-/, '');
}

export function ToolCallCard({ part }: { part: ToolPart }) {
  const toolName = formatToolName(part.type);
  const stateLabel = STATE_LABEL[part.state] ?? part.state;

  return (
    <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">
          {toolName}
        </span>
        <span className="text-xs text-zinc-500">{stateLabel}</span>
      </div>
      {'input' in part && part.input != null ? (
        <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs dark:bg-zinc-950">
          {JSON.stringify(part.input, null, 2)}
        </pre>
      ) : null}
      {'output' in part && part.output != null ? (
        <pre className="mt-2 overflow-x-auto rounded bg-emerald-50 p-2 text-xs text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          {JSON.stringify(part.output, null, 2)}
        </pre>
      ) : null}
      {'errorText' in part && part.errorText ? (
        <p className="mt-2 text-xs text-red-600">{part.errorText}</p>
      ) : null}
    </div>
  );
}
