import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignedAvatarImage } from "@/components/SignedAvatarImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Compass, Inbox, MessageCircle, User, Settings, LogOut, Wallet as WalletIcon, ShieldCheck, MessagesSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-role";
import { NotificationBell } from "./NotificationBell";
import { toast } from "sonner";

const navItems = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/matches", label: "Matches", icon: MessageCircle },
  { to: "/messages", label: "Chat", icon: MessagesSquare },
  { to: "/wallet", label: "Wallet", icon: WalletIcon },
  { to: "/profile", label: "Profile", icon: User },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { isModerator } = useRoles();
  const items = navItems;

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const initials = (profile?.display_name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((it) => (
              <NavLink
                key={it.label}
                to={it.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                    isActive
                      ? "bg-secondary text-primary font-bold"
                      : "text-muted-foreground font-medium hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-0.5 ring-2 ring-transparent transition-smooth hover:ring-accent/40">
                <Avatar className="h-9 w-9">
                  <SignedAvatarImage userId={profile?.user_id ?? null} enabled hasImage={!!profile?.has_profile_image} className="object-cover" />
                  <AvatarFallback className="bg-accent/15 text-accent font-semibold">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-semibold truncate">{profile?.display_name || "Member"}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.gender}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              {isModerator && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <ShieldCheck className="h-4 w-4" /> Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6 pb-24 md:py-8 md:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
        <div className="grid grid-cols-6">
          {items.map((it) => (
            <NavLink
              key={it.label}
              to={it.to}
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] transition-smooth ${
                  isActive ? "text-accent font-bold" : "text-muted-foreground font-medium"
                }`
              }
            >
              <it.icon className="h-5 w-5" />
              {it.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
