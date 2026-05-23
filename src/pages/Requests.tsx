import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignedAvatarImage } from "@/components/SignedAvatarImage";
import { useUnlockedIds } from "@/hooks/use-boost";
import { Badge } from "@/components/ui/badge";
import { Inbox, Plus, MapPin, Check, X, Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CreateRequestModal } from "@/components/CreateRequestModal";
import { ReportButton } from "@/components/ReportButton";
import { intentLabels, Intent } from "@/lib/intent";
import { toast } from "sonner";

type RequestRow = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  kind: "user" | "location";
  intent: Intent;
  message: string | null;
  status: "new" | "accepted" | "declined" | "expired";
  location_label: string | null;
  created_at: string;
  expires_at: string;
};

type ProfileLite = { user_id: string; display_name: string | null; has_profile_image: boolean | null; location: string | null };

const isExpired = (r: RequestRow) => new Date(r.expires_at).getTime() < Date.now();

const Requests = () => {
  const { user } = useAuth();
  const unlocks = useUnlockedIds();
  const [tab, setTab] = useState<"new" | "accepted" | "expired" | "sent">("new");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("requests")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const list = (data as RequestRow[]) ?? [];
    setRows(list);

    const ids = Array.from(new Set(list.flatMap((r) => [r.sender_id, r.recipient_id]).filter(Boolean) as string[]));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, has_profile_image, location")
        .in("user_id", ids);
      const map: Record<string, ProfileLite> = {};
      (profs as ProfileLite[] | null)?.forEach((p) => { map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`requests-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const incoming = rows.filter((r) => r.recipient_id === user?.id || (r.kind === "location" && r.sender_id !== user?.id));
  const sent = rows.filter((r) => r.sender_id === user?.id);

  const newOnes = incoming.filter((r) => r.status === "new" && !isExpired(r));
  const accepted = rows.filter((r) => r.status === "accepted");
  const expired = rows.filter((r) => r.status === "expired" || (r.status === "new" && isExpired(r)));

  const handleAccept = async (id: string) => {
    const { error } = await supabase.from("requests").update({ status: "accepted" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Request accepted — it's a match!");
  };
  const handleDecline = async (id: string) => {
    const { error } = await supabase.from("requests").update({ status: "declined" }).eq("id", id);
    if (error) toast.error(error.message); else toast("Request declined");
  };

  const renderCard = (r: RequestRow, mode: "incoming" | "sent" | "history") => {
    const otherId = r.sender_id === user?.id ? r.recipient_id : r.sender_id;
    const other = otherId ? profiles[otherId] : undefined;
    const initials = (other?.display_name || (r.kind === "location" ? r.location_label : "U") || "U").trim().charAt(0).toUpperCase();
    return (
      <div key={r.id} className="card-elevated flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Avatar className="h-12 w-12">
          <SignedAvatarImage
            userId={otherId ?? null}
            enabled={!!otherId && (otherId === user?.id || (unlocks.data?.has(otherId) ?? false))}
            hasImage={!!other?.has_profile_image}
            className="object-cover"
          />
          <AvatarFallback className="bg-accent/15 text-accent font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold truncate">
              {r.kind === "location" ? `Location: ${r.location_label}` : (other?.display_name ?? "Member")}
            </p>
            <Badge variant="secondary" className="font-medium">{intentLabels[r.intent]}</Badge>
            {r.kind === "location" && <Badge variant="outline"><MapPin className="mr-1 h-3 w-3" />Location</Badge>}
          </div>
          {r.message && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.message}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "sent" ? "Sent" : "Received"} · {new Date(r.created_at).toLocaleDateString()}
          </p>
        </div>
        {mode === "incoming" && r.status === "new" && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="brand" onClick={() => handleAccept(r.id)}><Check className="h-4 w-4" />Accept</Button>
            <Button size="sm" variant="outline" onClick={() => handleDecline(r.id)}><X className="h-4 w-4" />Decline</Button>
            <ReportButton targetType="request" targetId={r.id} />
          </div>
        )}
        {mode === "sent" && (
          <Badge variant={r.status === "accepted" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
        )}
        {mode === "history" && (
          <Badge variant="secondary" className="capitalize">{isExpired(r) && r.status === "new" ? "expired" : r.status}</Badge>
        )}
      </div>
    );
  };

  const Empty = ({ icon: Icon, title, body }: { icon: typeof Inbox; title: string; body: string }) => (
    <div className="card-elevated p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{body}</p>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Match requests</h1>
            <p className="mt-1 text-muted-foreground">Review introductions from members who want to connect.</p>
          </div>
          <Button variant="brand" className="hidden md:inline-flex" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4" /> New request
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="new">New {newOnes.length > 0 && <span className="ml-1 rounded-full bg-accent/15 px-1.5 text-[11px] font-bold text-accent">{newOnes.length}</span>}</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-3">
            {loading ? null : newOnes.length === 0
              ? <Empty icon={Inbox} title="No new requests" body="When someone sends you a match request, it'll show up here." />
              : newOnes.map((r) => renderCard(r, "incoming"))}
          </TabsContent>
          <TabsContent value="accepted" className="space-y-3">
            {accepted.length === 0
              ? <Empty icon={Check} title="No accepted requests yet" body="Accepted requests turn into matches and show up here too." />
              : accepted.map((r) => renderCard(r, r.sender_id === user?.id ? "sent" : "incoming"))}
          </TabsContent>
          <TabsContent value="sent" className="space-y-3">
            {sent.length === 0
              ? <Empty icon={Send} title="You haven't sent any requests" body="Tap the + button to send a connection request." />
              : sent.map((r) => renderCard(r, "sent"))}
          </TabsContent>
          <TabsContent value="expired" className="space-y-3">
            {expired.length === 0
              ? <Empty icon={Clock} title="Nothing expired" body="Requests expire after 7 days if not accepted." />
              : expired.map((r) => renderCard(r, "history"))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating + button (mobile-first) */}
      <button
        type="button"
        onClick={() => setOpenCreate(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-smooth hover:scale-105 md:bottom-8 md:right-8"
        aria-label="New request"
      >
        <Plus className="h-6 w-6" />
      </button>

      <CreateRequestModal open={openCreate} onOpenChange={setOpenCreate} onCreated={load} />
    </AppLayout>
  );
};

export default Requests;
