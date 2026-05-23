import { AvatarImage } from "@/components/ui/avatar";
import { useSignedProfileImage } from "@/components/ProfileImage";

/**
 * Drop-in replacement for <AvatarImage src={profile_image_url} />
 * Only fetches a signed URL when `enabled` (i.e. owner / match / unlocked).
 */
export function SignedAvatarImage({
  userId,
  enabled,
  hasImage,
  className,
}: {
  userId: string | null | undefined;
  enabled: boolean;
  hasImage: boolean;
  className?: string;
}) {
  const { data: url } = useSignedProfileImage(userId, enabled && hasImage);
  if (!url) return null;
  return <AvatarImage src={url} className={className} />;
}
