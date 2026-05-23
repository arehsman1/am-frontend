import { BadgeCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  verified: boolean | null | undefined;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Shows "Verified" or "Not Verified" status pill for a profile.
 * Display-only — does not gate any action.
 */
export const VerifiedBadge = ({ verified, className, size = "sm" }: Props) => {
  const isVerified = !!verified;
  const Icon = isVerified ? BadgeCheck : ShieldAlert;
  const label = isVerified ? "Verified" : "Not Verified";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        isVerified
          ? "border-success/30 bg-success/10 text-success"
          : "border-muted-foreground/20 bg-muted text-muted-foreground",
        className
      )}
      aria-label={label}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
};
