import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Fetches a short-lived signed URL for a profile image via the
 * `get-profile-image` edge function. The function returns `null`
 * if the caller is not allowed (no unlock, no match, not owner).
 */
export function useSignedProfileImage(targetId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["signed-profile-image", targetId],
    enabled: !!targetId && enabled,
    staleTime: 50 * 60 * 1000, // 50 min (URL valid 60 min)
    gcTime: 55 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-profile-image", {
        body: { target_id: targetId },
      });
      if (error) throw error;
      return (data?.url as string | null) ?? null;
    },
  });
}

type Props = {
  targetId: string | null | undefined;
  /** Whether the viewer is allowed to see the photo (owner / match / unlocked). */
  unlocked: boolean;
  /** Has any image on file (controls whether to attempt fetch / show locked state). */
  hasImage: boolean;
  alt?: string;
  initials?: string;
  className?: string;
  imgClassName?: string;
  /** When locked, render a Lock icon overlay. */
  showLockOverlay?: boolean;
};

/**
 * Single source of truth for rendering profile images.
 * - Never uses direct storage URLs.
 * - Only fetches the signed URL when `unlocked` is true.
 * - Renders an avatar fallback or a blurred lock state otherwise.
 */
export function ProfileImage({
  targetId,
  unlocked,
  hasImage,
  alt = "Profile",
  initials = "U",
  className,
  imgClassName,
  showLockOverlay = true,
}: Props) {
  const { data: url, isLoading } = useSignedProfileImage(targetId, unlocked && hasImage);

  if (!hasImage) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-secondary", className)}>
        <Avatar className="h-24 w-24">
          <AvatarFallback className="bg-accent/15 text-accent text-3xl font-bold">{initials}</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className={cn("relative h-full w-full bg-secondary", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-secondary to-accent/10" />
        {showLockOverlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/95 shadow-lg">
              <Lock className="h-5 w-5 text-accent" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading || !url) {
    return <div className={cn("h-full w-full animate-pulse bg-secondary", className)} />;
  }

  return <img src={url} alt={alt} className={cn("h-full w-full object-cover", imgClassName)} />;
}
