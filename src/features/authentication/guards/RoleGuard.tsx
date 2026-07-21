import React from "react";
import { Navigate } from "react-router-dom";
import { useRoles } from "@/features/authentication/hooks/useRoles";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import { DashboardLayoutSkeleton } from "@/components/ui/skeletons";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: DatabaseAppRole[];
  fallbackPath?: string;
  loadingSkeleton?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/auth", loadingSkeleton }: RoleGuardProps) {
  const { roles, loading } = useRoles();
  const hasAllowedRole = roles.some((role) => allowedRoles.includes(role));

  if (loading) {
    return <>{loadingSkeleton ?? <DashboardLayoutSkeleton />}</>;
  }

  if (hasAllowedRole) {
    return <>{children}</>;
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
