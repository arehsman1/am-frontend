import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Compass, Inbox, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BoostEntry } from "@/components/BoostEntry";

const DashboardMale = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = (profile?.display_name || "there").split(" ")[0];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome, {firstName}</h1>
          <p className="mt-1 text-muted-foreground">Discover people who match what you're looking for.</p>
        </div>

        <BoostEntry />

        <div className="card-elevated p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Compass className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Browse the Explore feed</h2>
            <p className="mt-1 text-sm text-muted-foreground">Boosted profiles appear first.</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => navigate("/explore")} className="shrink-0">
            Open Explore <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link to="/requests" className="group card-elevated p-7 flex items-center justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Inbox className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">Requests</h3>
              <p className="mt-1 text-sm text-muted-foreground">Manage incoming and sent requests</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
          <Link to="/matches" className="group card-elevated p-7 flex items-center justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">Matches</h3>
              <p className="mt-1 text-sm text-muted-foreground">People you've both said yes to</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardMale;
