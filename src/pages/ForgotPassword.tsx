import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Check your inbox for the reset link.");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="container flex items-center justify-between py-6">
        <Logo />
        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Back to <span className="text-accent">Sign in</span>
        </Link>
      </header>
      <main className="container flex-1 flex items-center justify-center py-10">
        <form onSubmit={submit} className="w-full max-w-md card-elevated p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold">Reset password</h1>
            <p className="mt-2 text-muted-foreground">
              {sent
                ? "If that email exists, we sent a reset link. Check spam too."
                : "We'll email you a secure link to set a new password."}
            </p>
          </div>
          {!sent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send reset link"}
              </Button>
            </>
          )}
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-semibold text-accent hover:underline">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default ForgotPassword;
