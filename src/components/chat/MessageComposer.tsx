import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

type Props = {
  onSend: (body: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
};

export const MessageComposer = ({ onSend, disabled, placeholder }: Props) => {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const body = value.trim();
    if (!body || sending || disabled) return;
    setSending(true);
    try {
      await onSend(body);
      setValue("");
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border bg-background p-3">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder ?? "Type a message…"}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-32 resize-none"
        />
        <Button
          onClick={submit}
          disabled={disabled || sending || value.trim().length === 0}
          size="icon"
          variant="hero"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Sharing phone numbers, payment info, or off-platform links may be blocked for your safety.
      </p>
    </div>
  );
};
