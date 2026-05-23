import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2 } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    if (!profile) return; // wait for profile load
    if (!profile.onboarded) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/explore", { replace: true });
    }
  }, [session, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 md:px-16">
        <Logo className="mb-10" />
        <div className="mx-auto w-full max-w-sm space-y-7 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" className="text-sm font-medium text-muted-foreground hover:text-accent">
                Forgot password?
              </Link>
            </div>
            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-semibold text-accent hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
      <div className="relative hidden md:block">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="relative flex h-full flex-col justify-end p-12 text-primary-foreground">
          <Heart className="h-10 w-10 text-accent" />
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight">Real people.<br/>Real chemistry.</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md">No fake profiles. No noise. Just real connections.</p>
        </div>
      </div>
    </div>
  );
};
export default Login;
