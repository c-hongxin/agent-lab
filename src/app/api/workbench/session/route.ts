import type { UIMessage } from "ai";

import { readSession, saveSession } from "@/lib/chat-sessions";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return Response.json({ error: "Missing session id" }, { status: 400 });
  }
  return Response.json({ messages: readSession(id) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    messages?: UIMessage[];
  };
  const id = body.id?.trim();
  if (!id || !Array.isArray(body.messages)) {
    return Response.json(
      { error: "Missing session id or messages" },
      { status: 400 },
    );
  }
  saveSession(id, body.messages);
  return Response.json({ success: true });
}
