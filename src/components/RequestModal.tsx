import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Lock } from "lucide-react";
import { Intent, intentLabels, maleIntents } from "@/lib/intent";
import { Profile } from "@/lib/mock";
import { sendRequest } from "@/lib/boost-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile | null;
  /** The viewer's gender — controls which intents are selectable. */
  viewerGender: "male" | "female";
  /** Profile's stated intent — used to enforce the female -> serious-only restriction. */
  profileIntent?: Intent;
  onSent?: () => void;
}

export const RequestModal = ({ open, onOpenChange, profile, viewerGender, profileIntent = "serious", onSent }: Props) => {
  const [intent, setIntent] = useState<Intent>("serious");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Female viewers can only request profiles whose intent is "serious".
  const femaleBlocked = viewerGender === "female" && profileIntent !== "serious";
  const options = viewerGender === "male" ? maleIntents : (["serious"] as Intent[]);

  const handleSend = async () => {
    if (!profile?.id) { toast.error("Missing recipient"); return; }
    setSending(true);
    const res = await sendRequest(profile.id);
    if (!res.ok) {
      setSending(false);
      if (res.error === "already_pending") {
        toast.error("You already sent a request to this member. Wait 12 hours or until they respond.");
      } else if (res.error === "cannot_request_self") {
        toast.error("You can't send a request to yourself.");
      } else {
        toast.error(res.error || "Could not send request");
      }
      return;
    }
    if (res.request_id && (intent !== "serious" || message.trim())) {
      await supabase
        .from("requests")
        .update({ intent, message: message.trim() || null })
        .eq("id", res.request_id);
    }
    setSending(false);
    toast.success(`Request sent to ${profile.name}`);
    setMessage("");
    onOpenChange(false);
    onSent?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Connection Request</DialogTitle>
          <DialogDescription>
            {profile ? `Reach out to ${profile.name} with a clear intent.` : "Choose your intent."}
          </DialogDescription>
        </DialogHeader>

        {femaleBlocked ? (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/60 p-4 text-sm">
            <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-muted-foreground">Requests disabled for this profile type. You can only connect with profiles looking for a serious relationship.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Intent</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIntent(i)}
                    className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-smooth ${
                      intent === i ? "border-accent bg-accent/5 text-foreground" : "border-border bg-background hover:border-accent/40"
                    }`}
                  >
                    {intentLabels[i]}
                  </button>
                ))}
              </div>
              {viewerGender === "female" && (
                <p className="text-xs text-muted-foreground">As a female user, your intent is fixed to serious relationship.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">Message (optional)</Label>
              <Textarea id="msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say something thoughtful…" />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!femaleBlocked && (
            <Button variant="brand" onClick={handleSend} disabled={sending}>
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send request"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
