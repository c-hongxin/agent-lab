import { z } from "zod";

// Demo A: schema registered in /api/chat; no server execute.
export const getViewportSizeSchema = z.object({});

export type GetViewportSizeInput = z.infer<typeof getViewportSizeSchema>;

// Read viewport in browser onToolCall — server has no window.
export function readViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
