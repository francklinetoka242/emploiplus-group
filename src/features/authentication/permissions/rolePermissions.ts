import type { AppRole } from "./roles";
import { ALL_PERMISSIONS, type Permission } from "./permissions";

const allPermissions = [...ALL_PERMISSIONS] as Permission[];

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  super_admin: [...allPermissions],
  admin: [
    "jobs.read",
    "jobs.create",
    "jobs.edit",
    "jobs.delete",
    "candidate.read",
    "candidate.update",
    "blog.read",
    "blog.write",
    "notifications.read",
    "notifications.manage",
    "services.manage",
    "dashboard.admin",
    "dashboard.candidate",
    "seo.manage",
    "team.manage",
  ],
  editor: ["jobs.read", "blog.read", "blog.write", "notifications.read", "services.manage"],
  candidate: [
    "dashboard.candidate",
    "candidate.read",
    "candidate.update",
    "candidate.apply",
    "jobs.read",
    "blog.read",
    "notifications.read",
  ],
  rh: ["candidate.read", "candidate.update", "dashboard.admin", "notifications.read"],
  company: ["jobs.read", "jobs.create", "jobs.edit", "candidate.read"],
  manager: ["jobs.read", "candidate.read", "notifications.read", "dashboard.admin"],
  accountant: ["candidate.read", "notifications.read"],
  recruiter: ["jobs.read", "candidate.read", "candidate.update", "candidate.apply"],
};

export function getPermissionsForRole(role?: string | null): Permission[] {
  if (!role) {
    return [];
  }

  const normalizedRole = role.toLowerCase();
  if (normalizedRole in ROLE_PERMISSIONS) {
    return ROLE_PERMISSIONS[normalizedRole as AppRole];
  }

  return [];
}
