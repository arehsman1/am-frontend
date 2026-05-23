import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageThread } from "@/components/chat/MessageThread";
import { MessageComposer } from "@/components/chat/MessageComposer";
import {
  listConversations,
  listMessages,
  sendMessage,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/chat-api";
import { useAuth } from "@/hooks/use-auth";
import { useViewerVerified } from "@/hooks/use-viewer-verified";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Messages = () => {
  const { user } = useAuth();
  const { isVerified, requireVerified } = useViewerVerified();
  const meId = user?.id ?? "me";

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);

  const [active, setActive] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load conversation list
  useEffect(() => {
    let cancelled = false;
    setLoadingConvos(true);
    listConversations().then((list) => {
      if (cancelled) return;
      setConversations(list);
      setLoadingConvos(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Load messages for active conversation
  const loadMessages = useCallback(async (convoId: string) => {
    setLoadingMessages(true);
    const m = await listMessages(convoId);
    setMessages(m);
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id);
  }, [active, loadMessages]);

  const handleSend = async (body: string) => {
    if (!active) return;
    if (!requireVerified()) return;

    // Optimistic insert
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      conversation_id: active.id,
      sender_id: meId,
      body,
      created_at: new Date().toISOString(),
      status: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendMessage(active.id, body);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...saved, sender_id: meId } : m))
      );
      // Bump conversation preview
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === active.id
              ? { ...c, last_message: body, last_message_at: new Date().toISOString() }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.last_message_at ?? 0).getTime() -
              new Date(a.last_message_at ?? 0).getTime()
          )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "This message contains restricted content.";
      toast.error(msg);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, status: "blocked" } : m))
      );
    }
  };

  const peerInitials = (active?.peer_name || "M").trim().charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Messages</h1>
          <p className="mt-1 text-muted-foreground">
            Chat with people you've matched with. Be respectful and stay safe.
          </p>
        </div>

        {!isVerified && (
          <div className="rounded-lg border border-accent/40 bg-accent/5 px-4 py-3 text-sm">
            Verify your account to start sending messages.
          </div>
        )}

        <div className="card-elevated overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 260px)", minHeight: 480 }}>
            {/* Conversation list — hidden on mobile when a conversation is open */}
            <aside
              className={cn(
                "border-r border-border bg-background min-h-0",
                active && "hidden md:block"
              )}
            >
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversations
                </h2>
              </div>
              <ConversationList
                conversations={conversations}
                activeId={active?.id ?? null}
                onSelect={setActive}
                loading={loadingConvos}
              />
            </aside>

            {/* Thread pane */}
            <section className={cn("flex flex-col min-h-0 bg-background", !active && "hidden md:flex")}>
              {active ? (
                <>
                  <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden -ml-2"
                      onClick={() => setActive(null)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-9 w-9">
                      {active.peer_avatar_url && (
                        <AvatarImage src={active.peer_avatar_url} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-accent/15 text-accent font-semibold">
                        {peerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{active.peer_name}</p>
                      <p className="text-xs text-muted-foreground">Matched</p>
                    </div>
                  </header>

                  <MessageThread messages={messages} meId={meId} loading={loadingMessages} />

                  <MessageComposer
                    onSend={handleSend}
                    disabled={!isVerified}
                    placeholder={isVerified ? "Type a message…" : "Verify your account to send messages"}
                  />
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div className="max-w-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold">Select a conversation</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Pick someone from the list to start chatting.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
