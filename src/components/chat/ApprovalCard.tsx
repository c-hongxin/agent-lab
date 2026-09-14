"use client";

import type { ReactNode } from "react";

type ApprovalCardProps = {
  title: string;
  children?: ReactNode;
  onApprove: () => void;
  onDeny: () => void;
  disabled?: boolean;
  approveLabel?: string;
  denyLabel?: string;
};

/** Demo B HITL：写操作等人确认时的通用确认卡 */
export function ApprovalCard({
  title,
  children,
  onApprove,
  onDeny,
  disabled = false,
  approveLabel = "批准",
  denyLabel = "拒绝",
}: ApprovalCardProps) {
  return (
    <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950">
      <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
        {title}
      </p>
      {children ? <div className="mb-2 space-y-1 text-xs">{children}</div> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          onClick={onApprove}
        >
          {approveLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-600 disabled:opacity-50"
          onClick={onDeny}
        >
          {denyLabel}
        </button>
      </div>
    </div>
  );
}
