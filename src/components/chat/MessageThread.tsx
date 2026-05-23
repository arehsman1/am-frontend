import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-api";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Props = {
  messages: ChatMessage[];
  meId: string;
  loading?: boolean;
};

export const MessageThread = ({ messages, meId, loading }: Props) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("flex", i % 2 ? "justify-end" : "justify-start")}>
            <div className="h-10 w-2/3 max-w-xs rounded-2xl bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-4 py-6 space-y-3">
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          const blocked = m.status === "blocked";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  mine
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm",
                  blocked && "opacity-70 ring-1 ring-destructive/40"
                )}
              >
                {blocked && (
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-destructive">
                    <ShieldAlert className="h-3 w-3" /> Blocked by safety filter
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                <p className={cn("mt-1 text-[10px]", mine ? "text-accent-foreground/70" : "text-muted-foreground")}>
                  {formatTime(m.created_at)}
                  {mine && m.status === "sending" && " · sending…"}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
};
