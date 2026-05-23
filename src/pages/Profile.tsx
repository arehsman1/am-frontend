import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileImage } from "@/components/ProfileImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileEditor } from "@/components/ProfileEditor";
import { useAuth } from "@/hooks/use-auth";
import { interestLabel } from "@/lib/interests";
import { MapPin, Pencil, Phone } from "lucide-react";

const Profile = () => {
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  if (!profile) return null;
  const initials = (profile.display_name || "U").trim().charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card-elevated overflow-hidden">
            <div className="relative aspect-[4/5] bg-secondary">
              <ProfileImage
                targetId={profile.user_id}
                unlocked
                hasImage={!!profile.has_profile_image}
                alt={profile.display_name ?? "Profile"}
                initials={initials}
              />
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold">{profile.display_name || "Your name"}</h2>
              <p className="mt-1 text-sm text-muted-foreground capitalize">
                {profile.age ? `${profile.age} · ` : ""}{profile.gender}
              </p>
              {profile.location && (
                <p className="mt-2 flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> {profile.location}
                </p>
              )}
              {profile.whatsapp && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {profile.whatsapp}
                </p>
              )}
              <Button variant="outline" className="mt-5 w-full" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Edit profile
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="card-elevated p-7">
            <h3 className="font-display text-lg font-bold">About me</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
              {profile.bio?.trim() || "No bio yet — add one from your profile editor."}
            </p>
          </section>

          <section className="card-elevated p-7">
            <h3 className="font-display text-lg font-bold">Looking for</h3>
            {profile.interests.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.interests.map((i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-normal">
                    {interestLabel(i)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Add your interests so we can find better matches.</p>
            )}
          </section>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <ProfileEditor onClose={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Profile;
