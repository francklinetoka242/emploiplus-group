import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";

const ALLOWED_ROLES: ReadonlyArray<DatabaseAppRole> = ["super_admin", "admin", "editor"];

export function resolveAuthRoles(claimRoles: Array<string | null | undefined>, dbRoles: Array<string | null | undefined>): DatabaseAppRole[] {
  const normalizedRoles = Array.from(
    new Set(
      [...claimRoles, ...dbRoles]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim())
        .filter((value): value is DatabaseAppRole => ALLOWED_ROLES.includes(value as DatabaseAppRole)),
    ),
  ) as DatabaseAppRole[];

  return normalizedRoles;
}
