import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash; getSession will pick it up.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated — you're signed in.");
    navigate("/explore", { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="container flex items-center justify-between py-6">
        <Logo />
      </header>
      <main className="container flex-1 flex items-center justify-center py-10">
        <form onSubmit={submit} className="w-full max-w-md card-elevated p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold">Set a new password</h1>
            <p className="mt-2 text-muted-foreground">
              {ready ? "Choose a new password for your account." : "Verifying reset link…"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="At least 6 characters" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={!ready} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={!ready} />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !ready}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Update password"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ResetPassword;
