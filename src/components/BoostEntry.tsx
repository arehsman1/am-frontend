import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet } from "lucide-react";
import { BoostModal } from "./BoostModal";
import { ActiveBoostBanner } from "./ActiveBoostBanner";
import { useWalletBalance, useBoostStatus } from "@/hooks/use-boost";
import { formatNaira } from "@/lib/boost-api";
import { useAuth } from "@/hooks/use-auth";

/**
 * Female-only Boost entry point.
 * Renders nothing for non-female users.
 */
export const BoostEntry = () => {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const wallet = useWalletBalance();
  const status = useBoostStatus();

  // Hard gate — boosts are female-only across the app.
  if (profile?.gender !== "female") return null;

  if (status.data?.active) {
    return (
      <>
        <ActiveBoostBanner onBoostAgain={() => setOpen(true)} />
        <BoostModal open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <section className="card-elevated p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <Sparkles className="h-4 w-4" /> Boost
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold">Get seen by more matches</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Activate a boost to appear at the top of Explore for thoughtful singles in your area.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Wallet:{" "}
              <strong className="text-foreground">
                {wallet.isLoading ? "—" : wallet.data ? formatNaira(wallet.data.balance) : "—"}
              </strong>
            </div>
          </div>
          <Button variant="hero" size="lg" onClick={() => setOpen(true)} className="shrink-0">
            <Sparkles className="h-4 w-4" /> Boost Your Profile
          </Button>
        </div>
      </section>
      <BoostModal open={open} onOpenChange={setOpen} />
    </>
  );
};
