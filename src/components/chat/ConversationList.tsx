import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "@/lib/chat-api";

const formatTime = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

type Props = {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (c: ChatConversation) => void;
  loading?: boolean;
};

export const ConversationList = ({ conversations, activeId, onSelect, loading }: Props) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-11 w-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No conversations yet. Match with someone to start chatting.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <ul className="divide-y divide-border">
        {conversations.map((c) => {
          const initials = (c.peer_name || "M").trim().charAt(0).toUpperCase();
          const isActive = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-smooth hover:bg-secondary/60",
                  isActive && "bg-secondary"
                )}
              >
                <Avatar className="h-11 w-11">
                  {c.peer_avatar_url && <AvatarImage src={c.peer_avatar_url} className="object-cover" />}
                  <AvatarFallback className="bg-accent/15 text-accent font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{c.peer_name}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatTime(c.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm truncate", c.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {c.last_message ?? "Say hi 👋"}
                    </p>
                    {c.unread_count > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
};
