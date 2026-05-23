import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Send, MapPin, User as UserIcon } from "lucide-react";
import { Intent, intentLabels, maleIntents } from "@/lib/intent";
import { supabase } from "@/integrations/supabase/client";
import { sendRequest } from "@/lib/boost-api";
import { useAuth } from "@/hooks/use-auth";
import { useViewerVerified } from "@/hooks/use-viewer-verified";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
  prefillRecipient?: { user_id: string; display_name: string | null; location: string | null } | null;
}

type Recipient = { user_id: string; display_name: string | null; location: string | null };

export const CreateRequestModal = ({ open, onOpenChange, onCreated, prefillRecipient }: Props) => {
  const { user, profile } = useAuth();
  const { requireVerified } = useViewerVerified();
  const [tab, setTab] = useState<"user" | "location">("user");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);
  const [picked, setPicked] = useState<Recipient | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [intent, setIntent] = useState<Intent>("serious");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const isFemale = profile?.gender === "female";
  const intents: Intent[] = isFemale ? ["serious"] : maleIntents;

  useEffect(() => {
    if (open && prefillRecipient) {
      setTab("user");
      setPicked(prefillRecipient);
      setSearch(prefillRecipient.display_name ?? "");
      setResults([]);
    }
  }, [open, prefillRecipient]);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (q.trim().length < 2) { setResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, location")
      .neq("user_id", user!.id)
      .ilike("display_name", `%${q.trim()}%`)
      .limit(8);
    setResults((data as Recipient[]) ?? []);
  };

  const reset = () => {
    setSearch(""); setResults([]); setPicked(null);
    setLocationLabel(""); setMessage(""); setIntent("serious"); setTab("user");
  };

  const handleSend = async () => {
    if (!user) return;
    if (!requireVerified()) return;
    if (tab === "user" && !picked) { toast.error("Pick a member first"); return; }
    if (tab === "location" && !locationLabel.trim()) { toast.error("Enter a location"); return; }

    setSending(true);

    if (tab === "user") {
      // Server RPC: enforces 12h cooldown + duplicate-prevention + auth checks.
      const res = await sendRequest(picked!.user_id);
      if (!res.ok) {
        setSending(false);
        if (res.error === "already_pending") {
          toast.error("You already have a pending request to this member. Wait 12 hours or until they respond.");
        } else if (res.error === "cannot_request_self") {
          toast.error("You can't send a request to yourself.");
        } else {
          toast.error(res.error || "Could not send request");
        }
        return;
      }
      // Enrich with intent + message after creation.
      if (res.request_id && (intent !== "serious" || message.trim())) {
        await supabase
          .from("requests")
          .update({ intent, message: message.trim() || null })
          .eq("id", res.request_id);
      }
      setSending(false);
      toast.success(`Request sent to ${picked!.display_name}`);
    } else {
      // Location broadcast — no per-recipient cooldown.
      const { error } = await supabase.from("requests").insert([{
        sender_id: user.id,
        kind: "location",
        intent,
        message: message.trim() || null,
        recipient_id: null,
        location_label: locationLabel.trim(),
      }]);
      setSending(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Location request broadcast");
    }

    reset();
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create request</DialogTitle>
          <DialogDescription>Connect with a specific member or anyone in a location.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "user" | "location")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user"><UserIcon className="mr-2 h-4 w-4" />Member</TabsTrigger>
            <TabsTrigger value="location"><MapPin className="mr-2 h-4 w-4" />Location</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-3">
            <div className="space-y-2">
              <Label>Search members</Label>
              <Input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Type a name…" />
            </div>
            {results.length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {results.map((r) => (
                  <button
                    key={r.user_id}
                    type="button"
                    onClick={() => { setPicked(r); setSearch(r.display_name ?? ""); setResults([]); }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span className="font-medium">{r.display_name ?? "Member"}</span>
                    <span className="text-xs text-muted-foreground">{r.location ?? ""}</span>
                  </button>
                ))}
              </div>
            )}
            {picked && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
                Selected: <strong>{picked.display_name}</strong>
              </div>
            )}
          </TabsContent>

          <TabsContent value="location" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="e.g. Lagos, Abuja, Port Harcourt" />
              <p className="text-xs text-muted-foreground">Members whose profile location matches will be notified.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Intent</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {intents.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIntent(i)}
                className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-smooth ${
                  intent === i ? "border-accent bg-accent/5 text-foreground" : "border-border hover:border-accent/40"
                }`}
              >
                {intentLabels[i]}
              </button>
            ))}
          </div>
          {isFemale && <p className="text-xs text-muted-foreground">As a female user, your intent is fixed to serious.</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="msg">Message (optional)</Label>
          <Textarea id="msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say something thoughtful…" />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="brand" onClick={handleSend} disabled={sending}>
            <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
