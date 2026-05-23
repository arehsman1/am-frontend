/**
 * Chat API — wired to the live backend.
 * See `src/lib/api.ts` for the underlying HTTP client.
 */
import { conversationsApi, messagesApi, type ApiConversation, type ApiMessage } from "@/lib/api";

export type ChatConversation = {
  id: string;
  peer_id: string;
  peer_name: string;
  peer_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  type?: string;
  is_closed?: boolean;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  status?: "sending" | "sent" | "delivered" | "blocked";
};

const adaptConversation = (c: ApiConversation): ChatConversation => ({
  id: c.id,
  peer_id: c.peer_id ?? "",
  peer_name: c.peer_name ?? "Match",
  peer_avatar_url: c.peer_avatar_url ?? null,
  last_message: c.last_message ?? null,
  last_message_at: c.last_message_at ?? null,
  unread_count: c.unread_count ?? 0,
  type: c.type,
  is_closed: c.is_closed,
});

const adaptMessage = (m: ApiMessage): ChatMessage => ({
  id: m.id,
  conversation_id: m.conversation_id,
  sender_id: m.sender_id,
  body: m.body,
  created_at: m.created_at,
  status: m.blocked ? "blocked" : "delivered",
});

export async function listConversations(): Promise<ChatConversation[]> {
  const list = await conversationsApi.list();
  return list.map(adaptConversation).sort(
    (a, b) =>
      new Date(b.last_message_at ?? 0).getTime() -
      new Date(a.last_message_at ?? 0).getTime()
  );
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const list = await messagesApi.list(conversationId);
  return list.map(adaptMessage);
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<ChatMessage> {
  const saved = await messagesApi.send(conversationId, body);
  return adaptMessage(saved);
}
