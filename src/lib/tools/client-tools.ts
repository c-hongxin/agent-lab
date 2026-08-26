import { z } from "zod";

/** 客户端 tool 的 schema（在 route 里注册，execute 在浏览器 onToolCall） */
export const getViewportSizeSchema = z.object({});

export type GetViewportSizeInput = z.infer<typeof getViewportSizeSchema>;

export function readViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
