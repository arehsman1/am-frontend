import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Loader2, Wallet, Check } from "lucide-react";
import { PLANS, type BoostPlan, activateBoost, formatNaira, initializeWalletTopup } from "@/lib/boost-api";
import { useAuth } from "@/hooks/use-auth";
import { useWalletBalance, useBoostStatus } from "@/hooks/use-boost";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export const BoostModal = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const wallet = useWalletBalance();
  const [selected, setSelected] = useState<BoostPlan | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insufficient, setInsufficient] = useState(false);

  const reset = () => {
    setSelected(null);
    setConfirming(false);
    setInsufficient(false);
    setLoading(false);
  };

  const handleClose = (v: boolean) => {
    if (!loading) {
      onOpenChange(v);
      if (!v) setTimeout(reset, 200);
    }
  };

  const handleConfirm = async () => {
    if (!user || !selected) return;
    setLoading(true);
    const res = await activateBoost(user.id, selected);
    setLoading(false);
    if ("success" in res && res.success) {
      toast.success("Boost activated successfully");
      qc.invalidateQueries({ queryKey: ["boost-status"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["boosted-users"] });
      onOpenChange(false);
      setTimeout(reset, 200);
    } else if ("error" in res && res.error === "INSUFFICIENT_BALANCE") {
      setInsufficient(true);
    } else {
      toast.error("Could not activate boost. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Boost Your Profile
          </DialogTitle>
          <DialogDescription>
            Get seen by more thoughtful matches in your area.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4" /> Wallet balance
          </span>
          <span className="font-display text-lg font-bold">
            {wallet.isLoading ? "—" : wallet.data ? formatNaira(wallet.data.balance) : "—"}
          </span>
        </div>

        {insufficient ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-semibold text-destructive">Insufficient balance</p>
              <p className="mt-1 text-muted-foreground">
                Add funds to your wallet to activate this boost.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setInsufficient(false)}>
                Back to plans
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                disabled={loading}
                onClick={async () => {
                  if (!selected) return;
                  setLoading(true);
                  const need = selected.price - (wallet.data?.balance ?? 0);
                  // Top up at least the shortfall, rounded up to nearest 500
                  const amount = Math.max(500, Math.ceil(need / 500) * 500);
                  const res = await initializeWalletTopup(amount);
                  setLoading(false);
                  if (res.ok) {
                    window.location.href = res.authorization_url;
                  } else {
                    toast.error("Could not start top-up. Please try again.");
                  }
                }}
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : "Add Funds"}
              </Button>
            </div>
          </div>
        ) : confirming && selected ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-card p-5">
              <p className="text-sm text-muted-foreground">You're activating</p>
              <p className="mt-1 font-display text-xl font-bold">{selected.duration} boost</p>
              <p className="mt-3 text-sm">
                This will deduct{" "}
                <strong className="text-foreground">{formatNaira(selected.price)}</strong> from your wallet. Continue?
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled={loading} onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" disabled={loading} onClick={handleConfirm}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Activating…</> : "Confirm"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANS.map((p) => {
                const active = selected?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`relative rounded-2xl border-2 p-5 text-left transition-smooth ${
                      active
                        ? "border-accent bg-accent/5 shadow-glow"
                        : p.popular
                        ? "border-accent/40 bg-card hover:border-accent"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    {p.popular && (
                      <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground hover:bg-accent">
                        MOST POPULAR
                      </Badge>
                    )}
                    {p.vip && (
                      <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground hover:bg-primary">
                        <Crown className="h-3 w-3 mr-1" /> VIP
                      </Badge>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-2xl font-bold">{formatNaira(p.price)}</span>
                      {active && <Check className="h-5 w-5 text-accent" />}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground">{p.duration}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{p.benefit}</p>
                  </button>
                );
              })}
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!selected}
              onClick={() => setConfirming(true)}
            >
              Continue
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
