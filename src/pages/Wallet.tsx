import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useWalletBalance, useTransactions } from "@/hooks/use-boost";
import { formatNaira, initializeWalletTopup, verifyWalletTopup } from "@/lib/boost-api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Wallet = () => {
  const wallet = useWalletBalance();
  const txns = useTransactions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);

  const presets = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;

    let active = true;
    (async () => {
      const res = await verifyWalletTopup(reference);
      if (!active) return;
      if (res.ok) {
        toast.success(res.already ? "Payment already verified." : "Wallet funded successfully.");
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["wallet"] }),
          qc.invalidateQueries({ queryKey: ["wallet-txns"] }),
        ]);
      } else {
        toast.error(`Could not verify payment: ${res.error}`);
      }
      window.history.replaceState({}, "", window.location.pathname);
    })();

    return () => { active = false; };
  }, [qc]);

  // Production top-up redirects to Paystack via the payment backend.
  const handleTopup = async () => {
    if (amount < 100) return;
    setLoading(true);
    const res = await initializeWalletTopup(amount);
    setLoading(false);
    if (res.ok === false) {
      toast.error(res.error === "not_authenticated" ? "Please sign in again." : `Could not start payment: ${res.error}`);
      return;
    }
    // Redirect the browser to Paystack's checkout URL.
    window.location.href = res.authorization_url;
  };



  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Wallet</h1>
          <p className="mt-1 text-muted-foreground">Use your balance to unlock profiles and boost your visibility.</p>
        </div>

        <div className="card-elevated p-7 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                <WalletIcon className="h-4 w-4" /> Balance
              </div>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums">
                {wallet.isLoading ? "—" : formatNaira(wallet.data?.balance ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Naira (₦) · powered by Paystack (test mode)</p>
            </div>
            <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add funds
            </Button>
          </div>
        </div>

        <section className="card-elevated p-7">
          <h3 className="font-display text-lg font-bold">Recent transactions</h3>
          {txns.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : !txns.data?.length ? (
            <p className="mt-4 text-sm text-muted-foreground">No transactions yet. Add funds to get started.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {txns.data.map((t) => {
                const credit = t.amount > 0;
                return (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${credit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{t.note || t.kind}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display text-sm font-bold tabular-nums ${credit ? "text-success" : "text-foreground"}`}>
                        {credit ? "+" : ""}{formatNaira(t.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">Bal {formatNaira(t.balance_after)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add funds</DialogTitle>
            <DialogDescription>You'll be redirected to Paystack to complete payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-lg border-2 px-2 py-2 text-sm font-semibold transition-smooth ${amount === p ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
                >
                  {formatNaira(p)}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amt">Custom amount (₦)</Label>
              <Input id="amt" type="number" min={100} max={100000} value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="hero" onClick={handleTopup} disabled={loading || amount < 100}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : `Pay ${formatNaira(amount || 0)} with Paystack`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Wallet;
