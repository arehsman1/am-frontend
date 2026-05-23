import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
type ReportRow = {
  id: string;
  reporter_id: string | null;
  target_type: "user" | "request" | "profile";
  target_id: string;
  reason: string;
  details: string | null;
  auto_flag: boolean;
  status: ReportStatus;
  created_at: string;
};

const AdminReports = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<ReportStatus>("open");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (status: ReportStatus) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("id, reporter_id, target_type, target_id, reason, details, auto_flag, status, created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows((data ?? []) as ReportRow[]);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const update = async (id: string, status: ReportStatus) => {
    const { error } = await supabase
      .from("reports")
      .update({ status, resolved_by: status === "resolved" || status === "dismissed" ? user?.id : null, resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    load(tab);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Triage user-submitted reports and auto-flagged content.</p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as ReportStatus)}>
          <TabsList>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : rows.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No {tab} reports.</p>
            ) : rows.map((r) => (
              <Card key={r.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">{r.target_type}</Badge>
                  {r.auto_flag && <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">auto-flagged</Badge>}
                  <Badge variant="secondary" className="capitalize">{r.status}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <p className="font-semibold">{r.reason}</p>
                  {r.details && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{r.details}</p>}
                  <p className="text-xs text-muted-foreground mt-2 font-mono">target: {r.target_id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status !== "reviewing" && <Button size="sm" variant="outline" onClick={() => update(r.id, "reviewing")}>Mark reviewing</Button>}
                  {r.status !== "resolved" && <Button size="sm" onClick={() => update(r.id, "resolved")}>Resolve</Button>}
                  {r.status !== "dismissed" && <Button size="sm" variant="ghost" onClick={() => update(r.id, "dismissed")}>Dismiss</Button>}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminReports;
