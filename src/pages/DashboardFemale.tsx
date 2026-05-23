import { AppLayout } from "@/components/AppLayout";
import { BoostEntry } from "@/components/BoostEntry";
import { useAuth } from "@/hooks/use-auth";
import { Inbox, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardFemale = () => {
  const { profile } = useAuth();
  const firstName = (profile?.display_name || "there").split(" ")[0];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome back, {firstName} ✨</h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening on your profile today.</p>
        </div>

        <BoostEntry />

        <div className="grid gap-5 md:grid-cols-2">
          <Link to="/requests" className="group card-elevated p-7 flex items-center justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Inbox className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">View Requests</h3>
              <p className="mt-1 text-sm text-muted-foreground">See who wants to connect</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
          <Link to="/matches" className="group card-elevated p-7 flex items-center justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">View Matches</h3>
              <p className="mt-1 text-sm text-muted-foreground">People you've both said yes to</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        </div>

        <div className="card-elevated p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold">Your activity will appear here</h3>
          <p className="mt-1 text-sm text-muted-foreground">As people view your profile and send requests, you'll see updates here.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardFemale;
