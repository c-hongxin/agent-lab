import { z } from "zod";

// Demo A：schema 在 /api/chat 注册，没有服务端 execute。
export const getViewportSizeSchema = z.object({});

export type GetViewportSizeInput = z.infer<typeof getViewportSizeSchema>;

// 真正读屏幕尺寸在浏览器 onToolCall 里调用，服务端没有 window。
export function readViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
