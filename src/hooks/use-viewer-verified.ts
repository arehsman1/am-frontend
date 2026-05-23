import { useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

/**
 * Viewer-side gate for interactive actions (Message, Like, Match Request).
 *
 * - `isVerified` reflects the current logged-in user's verification flag.
 * - `requireVerified(action)` runs `action` only if verified; otherwise
 *   shows the standard verification toast and returns false.
 */
export const useViewerVerified = () => {
  const { profile } = useAuth();
  const isVerified = !!profile?.is_verified;

  const requireVerified = useCallback(
    (action?: () => void): boolean => {
      if (!isVerified) {
        toast.error(
          "Verify your account to unlock messaging and connect with real people safely."
        );
        return false;
      }
      action?.();
      return true;
    },
    [isVerified]
  );

  return { isVerified, requireVerified };
};
