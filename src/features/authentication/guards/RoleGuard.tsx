import React from "react";
import { Navigate } from "react-router-dom";
import { useRoles } from "@/features/authentication/hooks/useRoles";
import { supabase } from "@/integrations/supabase/client";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: DatabaseAppRole[];
  fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/auth" }: RoleGuardProps) {
  const { roles, loading } = useRoles();
  const [fallbackTried, setFallbackTried] = React.useState(false);
  const [fallbackAllowed, setFallbackAllowed] = React.useState<boolean | null>(null);

  const hasAllowedRole = roles.some((role) => allowedRoles.includes(role));

  React.useEffect(() => {
    let mounted = true;
    async function tryFallback() {
      if (hasAllowedRole || loading || fallbackTried) return;
      setFallbackTried(true);
      try {
        const session = await supabase.auth.getSession();
        const userId = session.data?.session?.user?.id;
        if (!userId) {
          if (mounted) setFallbackAllowed(false);
          return;
        }
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
        const found = (data ?? []).some((r: any) => allowedRoles.includes(r.role));
        if (mounted) setFallbackAllowed(found);
      } catch (e) {
        if (mounted) setFallbackAllowed(false);
      }
    }
    void tryFallback();
    return () => {
      mounted = false;
    };
  }, [hasAllowedRole, loading, fallbackTried, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Vérification des rôles...</div>
      </div>
    );
  }

  if (hasAllowedRole) {
    return <>{children}</>;
  }

  if (fallbackAllowed === true) {
    return <>{children}</>;
  }

  if (fallbackAllowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Vérification des rôles...</div>
      </div>
    );
  }

  return (
    <Navigate
      to={fallbackPath}
      replace
      state={{
        authError: "unauthorized",
        authReason: `Rôle requis : ${allowedRoles.join(", ")}.`,
        authCurrentRoles: roles.length ? roles.join(", ") : "aucun rôle détecté",
      }}
    />
  );
}
