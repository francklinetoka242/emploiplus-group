export type AppRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "candidate"
  | "rh"
  | "company"
  | "manager"
  | "accountant"
  | "recruiter";

export type DatabaseAppRole = "super_admin" | "admin" | "editor";

export const DATABASE_ROLES: ReadonlyArray<DatabaseAppRole> = ["super_admin", "admin", "editor"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  candidate: "Candidate",
  rh: "RH",
  company: "Entreprise",
  manager: "Manager",
  accountant: "Comptable",
  recruiter: "Recruteur",
};
