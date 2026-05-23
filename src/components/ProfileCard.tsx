import { Profile } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Heart, Send, MapPin, Lock, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getUserGender } from "@/lib/user";
import { intentLabels } from "@/lib/intent";

interface Props {
  profile: Profile;
  onLike?: () => void;
  onRequest?: () => void;
  boosted?: boolean;
}

export const ProfileCard = ({ profile, onLike, onRequest, boosted }: Props) => {
  const viewer = getUserGender(); // {USER_GENDER === "male"}
  // Female viewers can only request profiles whose intent is "serious".
  const femaleBlocked = viewer === "female" && profile.intent !== "serious";
  const canAct = viewer === "male" || !femaleBlocked;

  return (
    <div className="group card-elevated overflow-hidden flex flex-col animate-fade-in">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img src={profile.image} alt={profile.name} loading="lazy" className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
        {/* Online status */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2 py-0.5 text-[11px] font-medium">
          <Circle className={`h-1.5 w-1.5 ${profile.online ? "fill-success text-success" : "fill-muted-foreground text-muted-foreground"}`} />
          {profile.online ? "Online" : profile.lastSeen ?? "Offline"}
        </div>
        {/* Intent + Boosted pills */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {boosted && (
            <div className="rounded-full bg-gradient-to-r from-accent to-primary text-accent-foreground px-2 py-0.5 text-[11px] font-bold shadow-glow">
              ⚡ Boosted
            </div>
          )}
          {profile.intent && (
            <div className="rounded-full bg-accent/90 text-accent-foreground px-2 py-0.5 text-[11px] font-medium">
              {intentLabels[profile.intent]}
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
          <div className="text-white">
            <h3 className="font-display text-xl font-bold">{profile.name}, {profile.age}</h3>
            {profile.city && (
              <div className="flex items-center gap-1 text-xs opacity-90"><MapPin className="h-3 w-3" /> {profile.city}</div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.interests.slice(0, 3).map((i) => (
            <Badge key={i} variant="secondary" className="font-normal">{i}</Badge>
          ))}
        </div>
        <div className="mt-auto pt-2">
          {canAct ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onLike}>
                <Heart className="h-4 w-4" /> Like
              </Button>
              <Button variant="brand" size="sm" className="flex-1" onClick={onRequest}>
                <Send className="h-4 w-4" /> Request
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Requests disabled for this profile type
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
