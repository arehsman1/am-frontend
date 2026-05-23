import { useQuery } from "@tanstack/react-query";
import {
  fetchBoostStatus,
  fetchBoostedUserIds,
  fetchWalletBalance,
  fetchTransactions,
  fetchUnlockedIds,
} from "@/lib/boost-api";
import { useAuth } from "./use-auth";

export const useWalletBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: fetchWalletBalance,
    enabled: !!user,
    staleTime: 15_000,
  });
};

export const useBoostStatus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["boost-status", user?.id],
    queryFn: fetchBoostStatus,
    enabled: !!user,
    refetchInterval: 60_000,
  });
};

export const useBoostedUserIds = () => {
  return useQuery({
    queryKey: ["boosted-users"],
    queryFn: fetchBoostedUserIds,
    staleTime: 60_000,
  });
};

export const useTransactions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet-txns", user?.id],
    queryFn: fetchTransactions,
    enabled: !!user,
  });
};

export const useUnlockedIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unlocks", user?.id],
    queryFn: fetchUnlockedIds,
    enabled: !!user,
  });
};
