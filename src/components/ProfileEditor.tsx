import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, Check, Lock } from "lucide-react";
import { Intent, intentLabels, maleIntents } from "@/lib/intent";
import { getUserGender } from "@/lib/user";
import { toast } from "sonner";

const STEPS = [
  "Photos", "Basic info", "Education", "Health", "Lifestyle", "Personality", "Financial", "Intent",
] as const;

type FormState = {
  photos: string[];
  fullName: string;
  age: string;
  gender: "male" | "female";
  stateOfOrigin: string;
  location: string; // City / Country — REQUIRED
  religion: string;
  occupation: string;
  isStudent: boolean;
  educationLevel: string;
  school: string;
  department: string;
  genotype: string;
  maritalStatus: string;
  hasChildren: string;
  wantChildren: string;
  smoking: string;
  drinking: string;
  communication: string;
  loveLanguage: string;
  employment: string;
  income: string;
  intent: Intent;
};

const ages = Array.from({ length: 43 }, (_, i) => `${i + 18}`);
const religions = ["Christianity", "Islam", "Judaism", "Hinduism", "Buddhism", "Spiritual", "Atheist", "Other"];
const educationLevels = ["Secondary", "OND/HND", "Bachelor's", "Master's", "Doctorate", "Other"];
const genotypes = ["AA", "AS", "SS", "AC", "SC"];
const maritalOpts = ["Single", "Divorced", "Widowed", "Separated"];
const yesNoMaybe = ["Yes", "No", "Maybe"];
const yesNo = ["Yes", "No"];
const habit = ["Yes", "No", "Occasionally"];
const commStyles = ["Direct", "Empathetic", "Playful", "Reserved"];
const loveLangs = ["Words of affirmation", "Acts of service", "Receiving gifts", "Quality time", "Physical touch"];
const employmentOpts = ["Employed", "Self-employed", "Student", "Looking for work"];
const incomeRanges = ["Prefer not to say", "Under ₦200k/mo", "₦200k–₦500k/mo", "₦500k–₦1M/mo", "₦1M+/mo"];

const placeholderPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
];

export const ProfileEditor = ({ onClose }: { onClose?: () => void }) => {
  const viewerGender = getUserGender();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    photos: placeholderPhotos,
    fullName: "Sophia Adekunle",
    age: "27",
    gender: viewerGender,
    stateOfOrigin: "Lagos",
    location: "Lagos / Nigeria",
    religion: "Christianity",
    occupation: "Architect",
    isStudent: false,
    educationLevel: "Master's",
    school: "",
    department: "",
    genotype: "AA",
    maritalStatus: "Single",
    hasChildren: "No",
    wantChildren: "Yes",
    smoking: "No",
    drinking: "Occasionally",
    communication: "Empathetic",
    loveLanguage: "Quality time",
    employment: "Employed",
    income: "Prefer not to say",
    intent: "serious",
  });

  // Female users are LOCKED to "serious".
  const intentOptions: Intent[] = viewerGender === "male" ? maleIntents : ["serious"];

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addPhoto = () => {
    if (form.photos.length >= 4) return;
    const seeds = [
      "1531746020798-e6953c6e8e04",
      "1438761681033-6461ffad8d80",
      "1544005313-94ddf0286df2",
      "1487412720507-e7ab37603c6f",
    ];
    const next = `https://images.unsplash.com/photo-${seeds[form.photos.length % seeds.length]}?auto=format&fit=crop&w=600&q=80`;
    set("photos", [...form.photos, next]);
  };
  const removePhoto = (i: number) => set("photos", form.photos.filter((_, idx) => idx !== i));

  const validate = (): string | null => {
    if (step === 1) {
      if (!form.fullName.trim()) return "Full name is required";
      if (!form.location.trim() || !form.location.includes("/")) return "Location is required (City / Country)";
    }
    if (step === 2 && !form.educationLevel) return "Education level is required";
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      toast.success("Profile saved");
      onClose?.();
    }
  };

  return (
    <div className="card-elevated p-6 md:p-8 animate-fade-in">
      {/* Stepper */}
      <div className="mb-7">
        <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="mt-3 hidden md:flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-smooth ${
                i === step ? "border-accent bg-accent/10 text-accent"
                : i < step ? "border-success/40 text-success" : "border-border text-muted-foreground"
              }`}
            >
              {i < step && <Check className="inline h-3 w-3 mr-1" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {step === 0 && (
          <div>
            <h3 className="font-display text-xl font-bold">Add up to 4 photos</h3>
            <p className="text-sm text-muted-foreground">Your first photo is your main profile picture.</p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.photos.map((src, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary group">
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {i === 0 && <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider bg-accent text-accent-foreground px-1.5 py-0.5 rounded">Main</span>}
                </div>
              ))}
              {form.photos.length < 4 && (
                <button onClick={addPhoto} className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-smooth">
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *">
              <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </Field>
            <Field label="Age">
              <Select value={form.age} onValueChange={(v) => set("age", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ages.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Gender (locked)">
              <Select value={form.gender} disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="State of origin">
              <Input value={form.stateOfOrigin} onChange={(e) => set("stateOfOrigin", e.target.value)} />
            </Field>
            <Field label="Current location * (City / Country)" full>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Lagos / Nigeria" />
            </Field>
            <Field label="Religion">
              <Select value={form.religion} onValueChange={(v) => set("religion", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{religions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Occupation">
              <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
            </Field>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input id="student" type="checkbox" checked={form.isStudent} onChange={(e) => set("isStudent", e.target.checked)} className="h-4 w-4 accent-accent" />
              <Label htmlFor="student" className="cursor-pointer">I'm currently a student</Label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Education level *">
              <Select value={form.educationLevel} onValueChange={(v) => set("educationLevel", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{educationLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={`School ${form.isStudent ? "*" : "(optional)"}`}>
              <Input value={form.school} onChange={(e) => set("school", e.target.value)} />
            </Field>
            <Field label="Department (optional)">
              <Input value={form.department} onChange={(e) => set("department", e.target.value)} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:max-w-sm">
            <Field label="Genotype">
              <Select value={form.genotype} onValueChange={(v) => set("genotype", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{genotypes.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marital status">
              <Select value={form.maritalStatus} onValueChange={(v) => set("maritalStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{maritalOpts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Have children">
              <Select value={form.hasChildren} onValueChange={(v) => set("hasChildren", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{yesNo.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Want children">
              <Select value={form.wantChildren} onValueChange={(v) => set("wantChildren", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{yesNoMaybe.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Smoking">
              <Select value={form.smoking} onValueChange={(v) => set("smoking", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{habit.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Drinking">
              <Select value={form.drinking} onValueChange={(v) => set("drinking", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{habit.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Communication style">
              <Select value={form.communication} onValueChange={(v) => set("communication", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{commStyles.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Love language">
              <Select value={form.loveLanguage} onValueChange={(v) => set("loveLanguage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{loveLangs.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Employment status">
              <Select value={form.employment} onValueChange={(v) => set("employment", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{employmentOpts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Income range (optional)">
              <Select value={form.income} onValueChange={(v) => set("income", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{incomeRanges.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl font-bold">What are you looking for?</h3>
              {viewerGender === "female" ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Female users are limited to serious relationships only.
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Pick the intent that best describes what you're after.</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {intentOptions.map((i) => {
                const active = form.intent === i;
                const disabled = viewerGender === "female" && i !== "serious";
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("intent", i)}
                    className={`rounded-xl border-2 p-4 text-left transition-smooth ${
                      active ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <p className="font-display font-bold">{intentLabels[i]}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-8 flex gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)} className="flex-1 sm:flex-none">Back</Button>
        <Button variant="brand" onClick={next} className="flex-1">
          {step === STEPS.length - 1 ? "Save profile" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

const Field = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
    <Label>{label}</Label>
    {children}
  </div>
);
