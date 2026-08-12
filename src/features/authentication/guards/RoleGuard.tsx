import React from "react";
import { Navigate } from "react-router-dom";
import { useRoles } from "@/features/authentication/hooks/useRoles";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: DatabaseAppRole[];
  fallbackPath?: string;
}

/**
 * RoleGuard: Pure authorization check
 *
 * Responsibilities:
 * - Verify user has one of the allowed roles
 * - Pass through to children if authorized
 * - Redirect to unauthorized if not authorized
 *
 * Assumptions:
 * - User is already authenticated (verified by AuthenticationGuard)
 * - Roles are already resolved and available (from Phase 1 core)
 * - No skeleton loading (authorization is synchronous check)
 *
 * Does NOT:
 * - Display any skeleton or loading UI
 * - Make any async calls
 * - Check rolesResolved status (assumed already done)
 */
export function RoleGuard({ children, allowedRoles, fallbackPath = "/auth" }: RoleGuardProps) {
  const { roles } = useRoles();

  // Direct role check - no loading state needed
  const hasAllowedRole = roles.some((role) => allowedRoles.includes(role));

  if (hasAllowedRole) {
    return <>{children}</>;
  }

  // Role check failed - redirect to unauthorized page
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
