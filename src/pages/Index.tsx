import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Send, Shield, ShieldCheck, UserPlus, Users, Heart, Flag, Eye, Loader2 } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useAuth } from "@/hooks/use-auth";

const steps = [
  { icon: UserPlus, title: "Create your profile", desc: "Sign up with your real details — WhatsApp number required for verified contact." },
  { icon: Users, title: "Browse real users", desc: "Discover people who match what you're actually looking for." },
  { icon: Send, title: "Send or receive requests", desc: "Reach out with intention. No mass messaging, no spam." },
  { icon: Heart, title: "Match confirmed", desc: "When both sides accept, your match is created. WhatsApp connection comes next." },
];

const Index = () => {
  const { loading, session, profile } = useAuth();

  // Logged-in users should never land on the public home page.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (session) {
    if (profile && !profile.onboarded) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/explore" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/40 via-background to-background" />
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24 lg:py-28 items-center">
          <div className="space-y-7 animate-fade-in">
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Find real connections. <span className="text-gradient">No fake profiles. No noise.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Amorematch is a real matchmaking platform — every profile is a verified person, every match is intentional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/login">Login</Link></Button>
              <Button asChild variant="outline" size="xl"><Link to="/signup">Create Account <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Verified users only</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Real matchmaking system</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Secure platform</div>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/30 to-primary/20 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
              <img src={heroImg} alt="People meeting through Amorematch" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">How it works</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Four steps. No swiping marathons.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="card-elevated p-6 relative">
                <span className="absolute right-5 top-5 font-display text-3xl font-extrabold text-secondary">0{i + 1}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section className="py-20 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">Safety</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">A safer place to meet people</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Verified members", desc: "Every account is tied to a real WhatsApp number." },
              { icon: Flag, title: "Report system", desc: "One tap to report abuse, fake profiles or harassment." },
              { icon: Eye, title: "Active moderation", desc: "Our admin team reviews reports and removes bad actors." },
            ].map((f) => (
              <div key={f.title} className="card-elevated p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-14 text-primary-foreground">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to meet someone real?</h2>
              <p className="mt-3 text-primary-foreground/80 text-lg">Join Amorematch today — your real match is one thoughtful step away.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl"><Link to="/signup">Create Account <ArrowRight className="h-4 w-4" /></Link></Button>
                <Button asChild size="xl" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
