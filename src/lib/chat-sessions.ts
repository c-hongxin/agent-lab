import type { UIMessage } from "ai";

// 演示用内存表。next dev 重启会丢；浏览器刷新还在。
const sessions = new Map<string, UIMessage[]>();

export function readSession(id: string) {
  return sessions.get(id) ?? [];
}

export function saveSession(id: string, messages: UIMessage[]) {
  sessions.set(id, messages);
}
