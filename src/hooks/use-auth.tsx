import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Gender = "male" | "female";

export type ProfileRow = {
  user_id: string;
  display_name: string | null;
  gender: Gender;
  whatsapp: string | null;
  age: number | null;
  location: string | null;
  interests: string[];
  bio: string | null;
  has_profile_image: boolean;
  onboarded: boolean;
  is_verified: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  gender: Gender | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const fetchProfile = async (userId: string): Promise<ProfileRow | null> => {
  const { data } = await supabase
    .from("profiles")
    .select("user_id, display_name, gender, age, location, interests, bio, has_profile_image, onboarded, is_verified")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  const { data: wa } = await supabase.rpc("get_whatsapp", { _target: userId });
  return { ...(data as Omit<ProfileRow, "whatsapp">), whatsapp: (wa as string | null) ?? null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const p = await fetchProfile(uid);
    setProfile(p);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        setProfile(null);
      } else {
        setTimeout(() => { loadProfile(s.user.id); }, 0);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) await loadProfile(s.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  // Realtime: subscribe to this user's profile row so avatar etc update everywhere instantly.
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => { loadProfile(user.id); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await loadProfile(user.id);
  }, [user?.id, loadProfile]);

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        gender: profile?.gender ?? null,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
