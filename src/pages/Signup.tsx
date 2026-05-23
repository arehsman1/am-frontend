import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/onboarding", { replace: true });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      toast.error("Please pick a gender — this is locked after signup.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { gender },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — let's set up your profile.");
    navigate("/onboarding", { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="container flex items-center justify-between py-6">
        <Logo />
        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Have an account? <span className="text-accent">Sign in</span>
        </Link>
      </header>
      <main className="container flex-1 flex items-center justify-center py-10">
        <form onSubmit={submit} className="w-full max-w-lg card-elevated p-8 md:p-10 animate-fade-in space-y-6">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Step 1 of 2 — basic details. Profile setup is next.</p>
          </div>

          <div>
            <Label className="mb-2 block">I am</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { v: "male", icon: User, label: "Male" },
                { v: "female", icon: Heart, label: "Female" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setGender(o.v)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-smooth ${
                    gender === o.v ? "border-accent bg-accent/5 shadow-glow" : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${gender === o.v ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"}`}>
                    <o.icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">{o.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Locked after signup.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="At least 6 characters" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !gender}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create account"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </form>
      </main>
    </div>
  );
};

export default Signup;
