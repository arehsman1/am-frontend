import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Trash2, User as UserIcon, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";

const Section = ({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) => (
  <section className="card-elevated p-7">
    <h3 className="font-display text-lg font-bold">{title}</h3>
    {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
    {children && <div className="mt-6 space-y-5">{children}</div>}
  </section>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your preferences and account.</p>
        </div>

        <Section title="Account" desc="Your sign-in details.">
          <div className="text-sm">
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Display name</p>
            <p className="font-medium">{profile?.display_name ?? "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/profile"><UserIcon className="h-4 w-4" /> Edit profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/wallet"><WalletIcon className="h-4 w-4" /> Manage wallet</Link>
            </Button>
          </div>
        </Section>

        <Section title="Notifications" desc="Choose how we reach you about new requests and matches.">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email notifications</p>
              <p className="text-xs text-muted-foreground">Match alerts and weekly highlights.</p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={(v) => { setEmailNotif(v); toast.success("Preference saved"); }} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">In-app notifications</p>
              <p className="text-xs text-muted-foreground">Live updates in the bell menu.</p>
            </div>
            <Switch checked={pushNotif} onCheckedChange={(v) => { setPushNotif(v); toast.success("Preference saved"); }} />
          </div>
        </Section>

        <Section title="Session">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </Section>

        <Section title="Danger zone" desc="Permanently delete your account and all associated data.">
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        </Section>
      </div>

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </AppLayout>
  );
};

export default Settings;
