'use client';

type ChatInputProps = {
  input: string;
  isBusy: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
};

export function ChatInput({
  input,
  isBusy,
  onInputChange,
  onSubmit,
  onStop,
}: ChatInputProps) {
  return (
    <form
      className="flex gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-900"
        placeholder="输入消息…"
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
      />
      <button
        type="submit"
        disabled={isBusy || !input.trim()}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        发送
      </button>
      {isBusy ? (
        <button
          type="button"
          onClick={onStop}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          停止
        </button>
      ) : null}
    </form>
  );
}
