import { useEffect, useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoostStatus } from "@/hooks/use-boost";

const formatRemaining = (ms: number) => {
  if (ms <= 0) return "Expired";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
};

export const ActiveBoostBanner = ({ onBoostAgain }: { onBoostAgain: () => void }) => {
  const { data, isLoading } = useBoostStatus();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (isLoading || !data?.active || !data.expires_at) return null;

  const remaining = new Date(data.expires_at).getTime() - now;

  return (
    <section className="card-elevated p-6 md:p-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-4 w-4 animate-pulse" /> Boost active
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold">Your profile is currently boosted</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.plan ? `${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} plan · ` : ""}
            Expires in <strong className="text-foreground tabular-nums">{formatRemaining(remaining)}</strong>
          </p>
        </div>
        <Button variant="soft" onClick={onBoostAgain} className="shrink-0">
          <TrendingUp className="h-4 w-4" /> Boost Again
        </Button>
      </div>
    </section>
  );
};
