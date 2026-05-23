import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignedAvatarImage } from "@/components/SignedAvatarImage";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type MatchRow = { id: string; user_a: string; user_b: string; created_at: string };
type ProfileLite = {
  user_id: string;
  display_name: string | null;
  has_profile_image: boolean | null;
  location: string | null;
  whatsapp: string | null;
};

const cleanWa = (n: string) => n.replace(/[^\d]/g, "");

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const list = (data as MatchRow[]) ?? [];
    setMatches(list);

    const ids = Array.from(new Set(list.map((m) => (m.user_a === user.id ? m.user_b : m.user_a))));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, has_profile_image, location")
        .in("user_id", ids);
      const map: Record<string, ProfileLite> = {};
      const base = (profs as Omit<ProfileLite, "whatsapp">[] | null) ?? [];
      // Fetch WhatsApp numbers via secure RPC (only returns value when matched)
      const waEntries = await Promise.all(
        base.map(async (p) => {
          const { data: wa } = await supabase.rpc("get_whatsapp", { _target: p.user_id });
          return [p.user_id, (wa as string | null) ?? null] as const;
        })
      );
      const waMap = Object.fromEntries(waEntries);
      base.forEach((p) => { map[p.user_id] = { ...p, whatsapp: waMap[p.user_id] ?? null }; });
      setProfiles(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`matches-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Your matches</h1>
          <p className="mt-1 text-muted-foreground">People you've both said yes to. WhatsApp is revealed for matched users.</p>
        </div>

        {loading ? null : matches.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold">No matches yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              When you and another member both accept a request, your match will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((m) => {
              const otherId = m.user_a === user?.id ? m.user_b : m.user_a;
              const p = profiles[otherId];
              const initials = (p?.display_name || "M").trim().charAt(0).toUpperCase();
              const wa = p?.whatsapp ? cleanWa(p.whatsapp) : "";
              return (
                <div key={m.id} className="card-elevated p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <SignedAvatarImage userId={otherId} enabled hasImage={!!p?.has_profile_image} className="object-cover" />
                      <AvatarFallback className="bg-accent/15 text-accent font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p?.display_name ?? "Member"}</p>
                      {p?.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {p.location}
                        </p>
                      )}
                    </div>
                    <Heart className="h-5 w-5 text-accent fill-accent" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/u/${otherId}`}>
                        <MessageCircle className="h-4 w-4" /> Profile
                      </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild className="flex-1">
                      <Link to={`/messages/${otherId}`}>
                        <MessageCircle className="h-4 w-4" /> Message
                      </Link>
                    </Button>
                    {wa && (
                      <Button variant="hero" size="sm" asChild className="flex-1">
                        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" /> WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Matches;
