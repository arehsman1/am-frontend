import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { INTERESTS, SERIOUS_INTENTS, type Interest } from "@/lib/interests";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge] = useState<string>("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [intent, setIntent] = useState<Interest | "">("");
  // Conditional fields (only required for serious/marriage)
  const [occupation, setOccupation] = useState("");
  const [religion, setReligion] = useState("");
  const [genotype, setGenotype] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [numberOfKids, setNumberOfKids] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const requiresExtras = intent !== "" && SERIOUS_INTENTS.includes(intent as Interest);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate("/login", { replace: true }); return; }
    if (profile?.onboarded) {
      navigate("/explore", { replace: true });
      return;
    }
    if (profile) {
      setName(profile.display_name ?? "");
      setWhatsapp(profile.whatsapp ?? "");
      setAge(profile.age?.toString() ?? "");
      setLocation(profile.location ?? "");
      setBio(profile.bio ?? "");
      const existing = (profile.interests as Interest[] | null)?.[0];
      if (existing) setIntent(existing);
      setOccupation((profile as any).occupation ?? "");
      setReligion((profile as any).religion ?? "");
      setGenotype((profile as any).genotype ?? "");
      setBloodGroup((profile as any).blood_group ?? "");
      setNumberOfKids((profile as any).number_of_kids?.toString() ?? "");
      setMaritalStatus((profile as any).marital_status ?? "");
      // Fetch existing image path + signed preview via secure RPC/edge function
      supabase.rpc("get_profile_image_path", { _target: session!.user.id }).then(({ data }) => {
        const path = (data as string | null) ?? null;
        setImagePath(path);
        if (path) {
          supabase.functions.invoke("get-profile-image", { body: { target_id: session!.user.id } })
            .then(({ data: d }) => setPreviewUrl((d?.url as string | null) ?? null));
        }
      });
    }
  }, [authLoading, session, profile, navigate]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    setImagePath(path);
    const { data: signed } = await supabase.storage.from("profile-images").createSignedUrl(path, 3600);
    setPreviewUrl(signed?.signedUrl ?? null);
    setUploading(false);
    toast.success("Photo uploaded");
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!whatsapp.trim()) { toast.error("WhatsApp number is required"); return; }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 18) { toast.error("You must be at least 18"); return; }
    if (!location.trim()) { toast.error("Location is required"); return; }
    if (!intent) { toast.error("Pick what you're looking for"); return; }
    if (requiresExtras) {
      if (!occupation.trim()) { toast.error("Occupation is required"); return; }
      if (!religion.trim()) { toast.error("Religion is required"); return; }
      if (!genotype.trim()) { toast.error("Genotype is required"); return; }
      if (!bloodGroup.trim()) { toast.error("Blood group is required"); return; }
      if (numberOfKids === "" || isNaN(parseInt(numberOfKids, 10))) { toast.error("Number of kids is required"); return; }
      if (!maritalStatus.trim()) { toast.error("Marital status is required"); return; }
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name.trim(),
        whatsapp: whatsapp.trim(),
        age: ageNum,
        location: location.trim(),
        bio: bio.trim() || null,
        interests: [intent],
        occupation: requiresExtras ? occupation.trim() : null,
        religion: requiresExtras ? religion.trim() : null,
        genotype: requiresExtras ? genotype.trim() : null,
        blood_group: requiresExtras ? bloodGroup.trim() : null,
        number_of_kids: requiresExtras ? parseInt(numberOfKids, 10) : null,
        marital_status: requiresExtras ? maritalStatus.trim() : null,
        profile_image_url: imagePath,
        onboarded: true,
      } as any)
      .eq("user_id", session.user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile complete!");
    navigate("/explore", { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="container flex items-center justify-between py-6">
        <Logo />
        <span className="text-sm text-muted-foreground">Step 2 of 2</span>
      </header>
      <main className="container flex-1 py-6 pb-16">
        <form onSubmit={submit} className="mx-auto w-full max-w-2xl card-elevated p-6 md:p-10 space-y-6 animate-fade-in">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold">Set up your profile</h1>
            <p className="mt-2 text-muted-foreground">A few real details so people can find you.</p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative h-28 w-28 rounded-full border-2 border-dashed border-border bg-secondary flex items-center justify-center overflow-hidden transition-smooth hover:border-accent"
            >
              {previewUrl ? (
                <Avatar className="h-full w-full">
                  <AvatarImage src={previewUrl} className="object-cover" />
                  <AvatarFallback>{(name[0] || "?").toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground group-hover:text-accent" />
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={18} max={99} value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234 800 000 0000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos, Nigeria" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What makes you, you?" maxLength={500} />
          </div>

          <div className="space-y-2">
            <Label>What are you looking for? (pick one)</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const active = intent === i.value;
                // Blur the others when a "serious" intent is locked in
                const lockOthers = intent !== "" && SERIOUS_INTENTS.includes(intent as Interest) && !active;
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => setIntent(i.value)}
                    disabled={lockOthers}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-smooth ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background hover:border-accent/50"
                    } ${lockOthers ? "opacity-40 blur-[1px] cursor-not-allowed" : ""}`}
                  >
                    {i.label}
                  </button>
                );
              })}
            </div>
            {requiresExtras && (
              <p className="text-xs text-muted-foreground">
                Serious & marriage-minded members share a few extra details below.
              </p>
            )}
          </div>

          {requiresExtras && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border p-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Input id="religion" value={religion} onChange={(e) => setReligion(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Genotype</Label>
                <Select value={genotype} onValueChange={setGenotype}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["AA", "AS", "SS", "AC", "SC"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kids">Number of kids</Label>
                <Input id="kids" type="number" min={0} max={20} value={numberOfKids} onChange={(e) => setNumberOfKids(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Marital status</Label>
                <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Single", "Divorced", "Widowed", "Separated"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving || uploading}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Complete profile"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Onboarding;
