"use client";

export type NotificationPreviewCardProps = {
  trigger_type_code: string;
  title: string;
  content: string;
  cta_text: string;
  locale: string;
};

export function NotificationPreviewCard({
  trigger_type_code,
  title,
  content,
  cta_text,
  locale,
}: NotificationPreviewCardProps) {
  return (
    <div className="mt-2 max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800">
        通知预览 · {trigger_type_code} · {locale}
      </div>
      <div className="px-4 py-3">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {content}
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 px-4 py-3">
        <button className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
          {cta_text}
        </button>
      </div>
    </div>
  );
}
