import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileImage } from "@/components/ProfileImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles, MapPin, Lock, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useBoostedUserIds, useUnlockedIds } from "@/hooks/use-boost";
import { interestLabel } from "@/lib/interests";
import { VerifiedBadge } from "@/components/VerifiedBadge";

type Card = {
  user_id: string;
  display_name: string | null;
  gender: "male" | "female";
  age: number | null;
  location: string | null;
  interests: string[];
  has_profile_image: boolean | null;
  is_verified: boolean;
};

const PAGE_SIZE = 12;

const Explore = () => {
  const { user, profile } = useAuth();
  const boosted = useBoostedUserIds();
  const unlocks = useUnlockedIds();

  const [rows, setRows] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    profile?.gender === "male" ? "female" : profile?.gender === "female" ? "male" : "all"
  );
  const [locFilter, setLocFilter] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      let q = supabase
        .from("profiles")
        .select("user_id, display_name, gender, age, location, interests, has_profile_image, is_verified")
        .eq("onboarded", true)
        .neq("user_id", user?.id ?? "")
        .order("updated_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (genderFilter !== "all") q = q.eq("gender", genderFilter);
      if (locFilter.trim()) q = q.ilike("location", `%${locFilter.trim()}%`);
      if (intentFilter !== "all") q = q.contains("interests", [intentFilter]);

      const { data } = await q;
      if (cancel) return;
      const fetched = (data as Card[]) ?? [];
      setHasMore(fetched.length === PAGE_SIZE);
      setRows((prev) => (page === 0 ? fetched : [...prev, ...fetched]));
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [user?.id, page, genderFilter, locFilter, intentFilter]);

  // Reset paging when filter changes
  useEffect(() => { setPage(0); }, [genderFilter, locFilter, intentFilter]);

  const ranked = useMemo(() => {
    const set = boosted.data ?? new Set<string>();
    return [...rows].sort((a, b) => {
      const aB = set.has(a.user_id) ? 1 : 0;
      const bB = set.has(b.user_id) ? 1 : 0;
      return bB - aB;
    });
  }, [rows, boosted.data]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold">Explore</h1>
          <p className="text-muted-foreground">Discover members. Boosted profiles appear first.</p>
        </div>

        <div className="card-elevated p-4 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={locFilter}
              onChange={(e) => setLocFilter(e.target.value)}
              placeholder="Filter by location"
              className="pl-9"
            />
          </div>
          <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v as typeof genderFilter)}>
            <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              <SelectItem value="female">Women</SelectItem>
              <SelectItem value="male">Men</SelectItem>
            </SelectContent>
          </Select>
          <Select value={intentFilter} onValueChange={setIntentFilter}>
            <SelectTrigger><SelectValue placeholder="Looking for" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any intent</SelectItem>
              <SelectItem value="serious">Serious relationship</SelectItem>
              <SelectItem value="marriage">Marriage minded</SelectItem>
              <SelectItem value="situationship">Situationship / No strings attached</SelectItem>
              <SelectItem value="friendship">Friendship</SelectItem>
              <SelectItem value="ovn_st">ovn/st</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && page === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <p className="mt-2 text-sm">Loading members…</p>
          </div>
        ) : ranked.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <p className="text-muted-foreground">No members match your filters yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ranked.map((c) => {
                const isBoosted = boosted.data?.has(c.user_id);
                const isUnlocked = unlocks.data?.has(c.user_id);
                const initials = (c.display_name || "U").trim().charAt(0).toUpperCase();
                return (
                  <Link
                    key={c.user_id}
                    to={`/u/${c.user_id}`}
                    className="card-elevated overflow-hidden group"
                  >
                    <div className="relative aspect-[4/5] bg-secondary">
                      <ProfileImage
                        targetId={c.user_id}
                        unlocked={!!isUnlocked}
                        hasImage={!!c.has_profile_image}
                        alt={c.display_name ?? "Member"}
                        initials={initials}
                      />
                      {isBoosted && (
                        <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground hover:bg-accent">
                          <Sparkles className="h-3 w-3 mr-1" /> Boosted
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2">
                        <VerifiedBadge verified={c.is_verified} />
                      </div>
                    </div>
                    <div className={`p-4 ${c.is_verified ? "" : "opacity-90"}`}>
                      <p className="font-display text-base font-bold truncate">{c.display_name || "Member"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {c.age ? `${c.age} · ` : ""}{c.gender}
                      </p>
                      {c.location && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="h-3 w-3" /> {c.location}
                        </p>
                      )}
                      {c.interests.slice(0, 2).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.interests.slice(0, 2).map((i) => (
                            <Badge key={i} variant="secondary" className="px-2 py-0.5 text-[10px] font-normal">
                              {interestLabel(i)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</> : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Explore;
