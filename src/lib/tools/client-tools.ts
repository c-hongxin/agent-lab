import { z } from "zod";

// Demo A：schema 挂在 /api/chat；无服务端 execute。
export const getViewportSizeSchema = z.object({});

export type GetViewportSizeInput = z.infer<typeof getViewportSizeSchema>;

// 在浏览器 onToolCall 里读视口——服务端没有 window。
export function readViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
