import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-role";
import { Loader2 } from "lucide-react";

export const AdminRoute = ({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) => {
  const { loading: authLoading, session } = useAuth();
  const { loading, isAdmin, isModerator } = useRoles();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  const allowed = requireAdmin ? isAdmin : isModerator;
  if (!allowed) return <Navigate to="/explore" replace />;
  return <>{children}</>;
};
