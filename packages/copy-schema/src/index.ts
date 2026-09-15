import { z } from "zod";

// Demo C：自造 trigger 字段 schema（Inspired by notification workflows）

export const bountyReviewRejectedFields = z.object({
  design_name: z.string().min(1, "design_name 必填"),
  reject_reason: z.string().min(1, "reject_reason 必填"),
});

export const bountyReviewApprovedFields = z.object({
  design_name: z.string().min(1, "design_name 必填"),
  target_count: z.number().int().positive("target_count 必须大于 0"),
});

export const announcementPublishedFields = z.object({
  announcement_title: z.string().min(1, "announcement_title 必填"),
  announcement_summary: z.string().min(1, "announcement_summary 必填"),
});

export const copyFieldSchemas = {
  bounty_review_rejected: bountyReviewRejectedFields,
  bounty_review_approved: bountyReviewApprovedFields,
  announcement_published: announcementPublishedFields,
};

export type TriggerTypeCode = keyof typeof copyFieldSchemas;

export function getCopyFieldSchema(triggerTypeCode: TriggerTypeCode) {
  return copyFieldSchemas[triggerTypeCode];
}
