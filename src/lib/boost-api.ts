// Wallet, boost & unlock API — backed by Supabase RPC functions.
// Paystack top-up is stubbed via a dev RPC for now.
import { supabase } from "@/integrations/supabase/client";

export type BoostPackage = "starter" | "pro" | "elite";

export type BoostPlan = {
  id: BoostPackage;
  name: string;
  price: number;       // NGN (kobo not used; integer naira)
  duration: string;
  benefit: string;
  popular?: boolean;
  vip?: boolean;
};

export const PLANS: BoostPlan[] = [
  { id: "starter", name: "Starter", price: 1000, duration: "24 hours", benefit: "Get more matches faster" },
  { id: "pro",     name: "Pro",     price: 2500, duration: "3 days",   benefit: "5x visibility — best value", popular: true },
  { id: "elite",   name: "Elite",   price: 6000, duration: "7 days",   benefit: "Top placement all week", vip: true },
];

export const UNLOCK_COST = 400;

export const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// ───────── Wallet ─────────
export type WalletBalance = { balance: number; currency: "NGN" };

export const fetchWalletBalance = async (): Promise<WalletBalance> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { balance: 0, currency: "NGN" };
  const { data } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  return { balance: data?.balance ?? 0, currency: "NGN" };
};

export type Txn = {
  id: string;
  kind: "topup" | "unlock" | "boost" | "refund" | "bonus";
  amount: number;
  balance_after: number;
  note: string | null;
  created_at: string;
};

export const fetchTransactions = async (): Promise<Txn[]> => {
  const { data } = await supabase
    .from("wallet_transactions")
    .select("id, kind, amount, balance_after, note, created_at")
    .order("created_at", { ascending: false })
    .limit(40);
  return (data as Txn[]) ?? [];
};

type RpcOk = { ok: boolean; balance?: number; expires_at?: string; boost_id?: string; already?: boolean; error?: string };

// ───────── Render-hosted Paystack init ─────────
// Production wallet top-up. POSTs to your payment backend, which returns a
// Paystack authorization URL the user is redirected to.
const WALLET_API_BASE_URL =
  (import.meta.env.VITE_WALLET_API_BASE_URL || import.meta.env.VITE_API_BASE_URL) as string;

const walletInitializeUrl = () =>
  new URL("/api/wallet/initialize", WALLET_API_BASE_URL).toString();

const walletVerifyUrl = (reference: string) => {
  const url = new URL("/api/wallet/verify", WALLET_API_BASE_URL);
  url.searchParams.set("reference", reference);
  return url.toString();
};

export type WalletInitResponse =
  | { ok: true; authorization_url: string; reference?: string }
  | { ok: false; error: string };

export const initializeWalletTopup = async (amount: number): Promise<WalletInitResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: "not_authenticated" };

  try {
    const res = await fetch(walletInitializeUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ amount }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || `init_failed_${res.status}` };
    const url = json.authorization_url || json.data?.authorization_url;
    if (!url) return { ok: false, error: "no_authorization_url" };
    return { ok: true, authorization_url: url, reference: json.reference || json.data?.reference };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network_error" };
  }
};

export type WalletVerifyResponse =
  | { ok: true; balance?: number; already?: boolean }
  | { ok: false; error: string };

export const verifyWalletTopup = async (reference: string): Promise<WalletVerifyResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: "not_authenticated" };

  try {
    const res = await fetch(walletVerifyUrl(reference), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || `verify_failed_${res.status}` };
    return json as WalletVerifyResponse;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network_error" };
  }
};

// ───────── send_request RPC (12h cooldown enforced server-side) ─────────
export const sendRequest = async (recipientId: string) => {
  const { data, error } = await supabase.rpc("send_request", { p_receiver: recipientId });
  if (error) return { ok: false as const, error: error.message };
  return (data as unknown as { ok: boolean; request_id?: string; error?: string }) ?? { ok: false, error: "no_response" };
};

// ───────── Boosts ─────────
export type BoostStatus = { active: boolean; plan?: BoostPackage; expires_at?: string };

export const fetchBoostStatus = async (): Promise<BoostStatus> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: false };
  const { data } = await supabase
    .from("boosts")
    .select("package, expires_at")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { active: false };
  return { active: true, plan: data.package as BoostPackage, expires_at: data.expires_at };
};

export const fetchBoostedUserIds = async (): Promise<Set<string>> => {
  const { data } = await supabase
    .from("boosts")
    .select("user_id")
    .gt("expires_at", new Date().toISOString());
  return new Set((data ?? []).map((d: { user_id: string }) => d.user_id));
};

export type ActivateResponse =
  | { success: true; expires_at: string; balance: number }
  | { success?: false; error: string };

export const activateBoost = async (_userId: string, plan: BoostPlan): Promise<ActivateResponse> => {
  const { data, error } = await supabase.rpc("activate_boost", { _package: plan.id });
  if (error) return { error: error.message };
  const d = data as unknown as RpcOk | null;
  if (!d?.ok) {
    if (d?.error === "insufficient_balance") return { error: "INSUFFICIENT_BALANCE" };
    return { error: d?.error ?? "UNKNOWN" };
  }
  return { success: true, expires_at: d.expires_at!, balance: d.balance! };
};

// ───────── Profile unlock ─────────
export const fetchUnlockedIds = async (): Promise<Set<string>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("profile_unlocks")
    .select("target_id")
    .eq("viewer_id", user.id);
  return new Set((data ?? []).map((d: { target_id: string }) => d.target_id));
};

export const unlockProfile = async (targetId: string) => {
  const { data, error } = await supabase.rpc("unlock_profile", { _target: targetId });
  if (error) return { ok: false as const, error: error.message };
  return (data as unknown as RpcOk) ?? { ok: false as const, error: "no_response" };
};
