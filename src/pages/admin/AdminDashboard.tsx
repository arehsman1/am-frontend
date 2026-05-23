import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, Users, ShieldAlert, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-role";

const AdminDashboard = () => {
  const { isAdmin } = useRoles();
  const [stats, setStats] = useState<{ open: number; auto: number; users: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ count: open }, { count: auto }, { count: users }] = await Promise.all([
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("auto_flag", true).eq("status", "open"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({ open: open ?? 0, auto: auto ?? 0, users: users ?? 0 });
    })();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground">Moderation, reports, and platform safety.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><Flag className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Open reports</p>
                <p className="text-2xl font-bold">{stats ? stats.open : <Loader2 className="h-5 w-5 animate-spin" />}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><ShieldAlert className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Auto-flagged</p>
                <p className="text-2xl font-bold">{stats ? stats.auto : <Loader2 className="h-5 w-5 animate-spin" />}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total users</p>
                <p className="text-2xl font-bold">{stats ? stats.users : <Loader2 className="h-5 w-5 animate-spin" />}</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/admin/reports">Manage reports</Link></Button>
          {isAdmin && <Button asChild variant="outline"><Link to="/admin/roles">Manage roles</Link></Button>}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
