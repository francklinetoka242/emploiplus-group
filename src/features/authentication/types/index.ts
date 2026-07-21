import type { Session } from "@supabase/supabase-js";
import type { Permission } from "@/features/authentication/permissions/permissions";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";

export interface AuthenticatedAppMetadata {
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

export interface AuthenticatedUserMetadata extends Omit<Session["user"], "app_metadata"> {
  app_metadata: AuthenticatedAppMetadata;
}

export interface AuthenticatedSession extends Omit<Session, "user"> {
  user: AuthenticatedUserMetadata;
}

export interface AuthMetadataSnapshot {
  roles: DatabaseAppRole[];
  permissions: Permission[];
}

export function getAuthMetadataFromSession(session: Session | null | undefined): AuthMetadataSnapshot {
  if (!session?.user?.app_metadata) {
    return { roles: [], permissions: [] };
  }

  const rawRoles = Array.isArray(session.user.app_metadata.roles)
    ? session.user.app_metadata.roles.filter((value): value is string => typeof value === "string")
    : [];

  const rawPermissions = Array.isArray(session.user.app_metadata.permissions)
    ? session.user.app_metadata.permissions.filter((value): value is string => typeof value === "string")
    : [];

  return {
    roles: rawRoles.filter((role): role is DatabaseAppRole => ["super_admin", "admin", "editor"].includes(role as DatabaseAppRole)),
    permissions: rawPermissions.filter((permission): permission is Permission =>
      ["jobs.read", "jobs.create", "jobs.edit", "jobs.delete", "candidate.read", "candidate.update", "candidate.apply", "blog.read", "blog.write", "notifications.read", "notifications.manage", "services.manage", "dashboard.admin", "dashboard.candidate", "seo.manage", "team.manage"].includes(permission as Permission),
    ),
  };
}
