import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = { id: string; user_id: string; role: "admin" | "moderator" | "user"; display_name: string | null };

const AdminRoles = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "moderator">("moderator");

  const load = async () => {
    setLoading(true);
    const { data: r } = await supabase.from("user_roles").select("id, user_id, role").order("created_at", { ascending: false });
    const ids = Array.from(new Set((r ?? []).map((x) => x.user_id)));
    const profilesById: Record<string, string | null> = {};
    if (ids.length) {
      const { data: p } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
      (p ?? []).forEach((x: { user_id: string; display_name: string | null }) => { profilesById[x.user_id] = x.display_name; });
    }
    setRows((r ?? []).map((x) => ({ ...x, display_name: profilesById[x.user_id] ?? null })) as Row[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role });
    if (error) { toast.error(error.message); return; }
    toast.success("Role granted");
    setUserId("");
    load();
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Role revoked");
    load();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Grant or revoke admin and moderator access.</p>
        </div>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">Grant role</h2>
          <form onSubmit={grant} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="space-y-1">
              <Label htmlFor="uid">User ID</Label>
              <Input id="uid" placeholder="uuid…" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "moderator")} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="flex items-end"><Button type="submit">Grant</Button></div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Current roles</h2>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No roles assigned yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <Badge variant={r.role === "admin" ? "default" : "secondary"} className="capitalize">{r.role}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.display_name || "—"}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{r.user_id}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => revoke(r.id)} aria-label="Revoke">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminRoles;
