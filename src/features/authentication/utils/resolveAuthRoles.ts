import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";

const ALLOWED_ROLES: ReadonlyArray<DatabaseAppRole> = [
  "super_admin",
  "admin",
  "editor",
  "candidate",
];

export function resolveAuthRoles(
  claimRoles: Array<string | null | undefined>,
  dbRoles: Array<string | null | undefined>,
): DatabaseAppRole[] {
  const normalizedRoles = Array.from(
    new Set(
      [...claimRoles, ...dbRoles]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim())
        .filter((value): value is DatabaseAppRole =>
          ALLOWED_ROLES.includes(value as DatabaseAppRole),
        ),
    ),
  ) as DatabaseAppRole[];

  return normalizedRoles;
}

export function normalizeAppMetadataRoles(
  appMetadata?: Record<string, unknown> | null,
): DatabaseAppRole[] {
  const claimRoles: string[] = [];

  const role = appMetadata?.role;
  if (typeof role === "string" && role.trim()) {
    claimRoles.push(role.trim());
  }

  const roles = appMetadata?.roles;
  if (Array.isArray(roles)) {
    claimRoles.push(
      ...roles
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim()),
    );
  }

  return resolveAuthRoles(claimRoles, []);
}
