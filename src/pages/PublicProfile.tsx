import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileImage } from "@/components/ProfileImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Lock, MapPin, MessageSquarePlus, Wallet as WalletIcon, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useWalletBalance, useUnlockedIds } from "@/hooks/use-boost";
import { UNLOCK_COST, unlockProfile, formatNaira } from "@/lib/boost-api";
import { interestLabel } from "@/lib/interests";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateRequestModal } from "@/components/CreateRequestModal";
import { ReportButton } from "@/components/ReportButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useViewerVerified } from "@/hooks/use-viewer-verified";

type PublicProfileRow = {
  user_id: string;
  display_name: string | null;
  gender: "male" | "female";
  age: number | null;
  location: string | null;
  bio: string | null;
  interests: string[];
  has_profile_image: boolean | null;
  is_verified: boolean;
};

const PublicProfile = () => {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const wallet = useWalletBalance();
  const unlocks = useUnlockedIds();
  const qc = useQueryClient();
  const { requireVerified } = useViewerVerified();

  const [p, setP] = useState<PublicProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, gender, age, location, bio, interests, has_profile_image, is_verified")
        .eq("user_id", userId)
        .maybeSingle();
      if (!cancel) { setP(data as PublicProfileRow | null); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [userId]);

  if (loading) {
    return <AppLayout><div className="py-20 text-center text-muted-foreground">Loading profile…</div></AppLayout>;
  }
  if (!p) {
    return (
      <AppLayout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Profile not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </AppLayout>
    );
  }

  const isSelf = user?.id === p.user_id;
  const isUnlocked = isSelf || unlocks.data?.has(p.user_id) || false;
  const initials = (p.display_name || "U").trim().charAt(0).toUpperCase();
  const balance = wallet.data?.balance ?? 0;

  const handleUnlock = async () => {
    setUnlocking(true);
    const res = await unlockProfile(p.user_id);
    setUnlocking(false);
    if (!res.ok) {
      if (res.error === "insufficient_balance") {
        toast.error("Not enough balance. Top up your wallet to unlock.");
        setUnlockOpen(false);
        navigate("/wallet");
        return;
      }
      toast.error(res.error || "Unlock failed");
      return;
    }
    toast.success(res.already ? "Already unlocked" : "Profile unlocked");
    qc.invalidateQueries({ queryKey: ["unlocks"] });
    qc.invalidateQueries({ queryKey: ["wallet"] });
    qc.invalidateQueries({ queryKey: ["wallet-txns"] });
    setUnlockOpen(false);
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card-elevated overflow-hidden">
            <div className="relative aspect-[4/5] bg-secondary">
              <ProfileImage
                targetId={p.user_id}
                unlocked={!!isUnlocked}
                hasImage={!!p.has_profile_image}
                alt={p.display_name ?? "Profile"}
                initials={initials}
                showLockOverlay={false}
              />
              {!isUnlocked && p.has_profile_image && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/95 shadow-lg">
                    <Lock className="h-7 w-7 text-accent" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground bg-background/95 px-3 py-1 rounded-full">
                    Locked
                  </p>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl font-bold">{p.display_name || "Member"}</h2>
                <VerifiedBadge verified={p.is_verified} size="md" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground capitalize">
                {p.age ? `${p.age} · ` : ""}{p.gender}
              </p>
              {p.location && (
                <p className="mt-2 flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> {p.location}
                </p>
              )}

              {!isSelf && (
                <div className="mt-5 space-y-2">
                  {!isUnlocked && p.has_profile_image && (
                    <Button variant="hero" className="w-full" onClick={() => requireVerified(() => setUnlockOpen(true))}>
                      <Lock className="h-4 w-4" /> Unlock photo · {formatNaira(UNLOCK_COST)}
                    </Button>
                  )}
                  <Button variant="brand" className="w-full" onClick={() => requireVerified(() => setRequestOpen(true))}>
                    <MessageSquarePlus className="h-4 w-4" /> Send request
                  </Button>
                  <ReportButton targetType="profile" targetId={p.user_id} variant="outline" />
                </div>
              )}
              {isSelf && (
                <Button variant="outline" className="mt-5 w-full" asChild>
                  <Link to="/profile">View your profile</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="card-elevated p-7">
            <h3 className="font-display text-lg font-bold">About</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
              {p.bio?.trim() || "This member hasn't added a bio yet."}
            </p>
          </section>

          <section className="card-elevated p-7">
            <h3 className="font-display text-lg font-bold">Looking for</h3>
            {p.interests.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.interests.map((i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-normal">
                    {interestLabel(i)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Not specified.</p>
            )}
          </section>
        </div>
      </div>

      <Dialog open={unlockOpen} onOpenChange={(v) => !unlocking && setUnlockOpen(v)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Unlock profile photo</DialogTitle>
            <DialogDescription>One-time fee to view this member's photo in full quality.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-display text-2xl font-bold">{formatNaira(UNLOCK_COST)}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <WalletIcon className="h-4 w-4" /> Wallet
              </span>
              <span className="font-bold tabular-nums">{formatNaira(balance)}</span>
            </div>
            {balance < UNLOCK_COST && (
              <p className="text-sm text-destructive">Insufficient balance — top up to continue.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setUnlockOpen(false)} disabled={unlocking}>Cancel</Button>
            {balance < UNLOCK_COST ? (
              <Button variant="hero" onClick={() => { setUnlockOpen(false); navigate("/wallet"); }}>
                Add funds
              </Button>
            ) : (
              <Button variant="hero" onClick={handleUnlock} disabled={unlocking}>
                {unlocking ? <><Loader2 className="h-4 w-4 animate-spin" /> Unlocking…</> : "Confirm unlock"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateRequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        prefillRecipient={{ user_id: p.user_id, display_name: p.display_name, location: p.location }}
      />
    </AppLayout>
  );
};

export default PublicProfile;
