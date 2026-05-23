/**
 * Backend API client for the matchmaking service.
 *
 * Base URL is configured with VITE_API_BASE_URL.
 * All requests attach the current Supabase auth JWT as Bearer token.
 */
import { supabase } from "@/integrations/supabase/client";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, query, signal } = opts;

  const url = new URL(path.replace(/^\//, ""), API_BASE_URL + "/");
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(await authHeader()),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in (data as Record<string, unknown>) &&
        String((data as Record<string, unknown>).message)) ||
      (data && typeof data === "object" && "error" in (data as Record<string, unknown>) &&
        String((data as Record<string, unknown>).error)) ||
      `Request failed: ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

// ---- Domain helpers -------------------------------------------------------

// Users
export type ApiUser = {
  id: string;
  display_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: "male" | "female" | string | null;
  location?: string | null;
  interests?: string[];
  is_verified?: boolean;
  is_muted?: boolean;
  is_banned?: boolean;
};

export const usersApi = {
  list: () => api<ApiUser[]>("/users"),
  get: (id: string) => api<ApiUser>(`/users/${id}`),
  updateMe: (patch: Partial<ApiUser>) =>
    api<ApiUser>("/users/me", { method: "PATCH", body: patch }),
};

// Match requests
export const matchApi = {
  send: (target_user_id: string) =>
    api<{ ok: boolean; request_id?: string }>("/match-request", {
      method: "POST",
      body: { target_user_id },
    }),
  accept: (request_id: string) =>
    api<{ ok: boolean; conversation_id?: string }>("/match-accept", {
      method: "POST",
      body: { request_id },
    }),
};

// Conversations
export type ApiConversation = {
  id: string;
  type: "match" | "support" | "dispute" | string;
  participants: string[];
  peer_id?: string;
  peer_name?: string;
  peer_avatar_url?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count?: number;
  is_closed?: boolean;
};

export const conversationsApi = {
  list: () => api<ApiConversation[]>("/conversations"),
  create: (payload: {
    type: "match" | "support" | "dispute";
    participant_ids?: string[];
  }) => api<ApiConversation>("/conversations", { method: "POST", body: payload }),
};

// Messages
export type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  blocked?: boolean;
  reason?: string | null;
};

export const messagesApi = {
  list: (conversationId: string) =>
    api<ApiMessage[]>(`/messages/${conversationId}`),
  send: (conversation_id: string, body: string) =>
    api<ApiMessage>("/messages", {
      method: "POST",
      body: { conversation_id, body },
    }),
};

// Reports
export const reportsApi = {
  create: (reported_user_id: string, reason: string, details?: string) =>
    api<{ ok: boolean }>("/report", {
      method: "POST",
      body: { reported_user_id, reason, details },
    }),
};

// Support / Dispute
export const supportApi = {
  open: (subject?: string) =>
    api<ApiConversation>("/support", { method: "POST", body: { subject } }),
};

export const disputeApi = {
  open: (user_a_id: string, user_b_id: string, reason?: string) =>
    api<ApiConversation>("/dispute", {
      method: "POST",
      body: { user_a_id, user_b_id, reason },
    }),
};

// Admin actions
export const adminApi = {
  mute: (user_id: string) =>
    api<{ ok: boolean }>("/admin/mute", { method: "POST", body: { user_id } }),
  unmute: (user_id: string) =>
    api<{ ok: boolean }>("/admin/unmute", { method: "POST", body: { user_id } }),
  ban: (user_id: string) =>
    api<{ ok: boolean }>("/admin/ban", { method: "POST", body: { user_id } }),
  unban: (user_id: string) =>
    api<{ ok: boolean }>("/admin/unban", { method: "POST", body: { user_id } }),
  closeChat: (conversation_id: string) =>
    api<{ ok: boolean }>("/admin/close-chat", {
      method: "POST",
      body: { conversation_id },
    }),
};
