export const ALL_PERMISSIONS = [
  "jobs.read",
  "jobs.create",
  "jobs.edit",
  "jobs.delete",
  "candidate.read",
  "candidate.update",
  "candidate.apply",
  "blog.read",
  "blog.write",
  "notifications.read",
  "notifications.manage",
  "services.manage",
  "dashboard.admin",
  "dashboard.candidate",
  "seo.manage",
  "team.manage",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "jobs.read": "Lire les offres",
  "jobs.create": "Créer des offres",
  "jobs.edit": "Modifier des offres",
  "jobs.delete": "Supprimer des offres",
  "candidate.read": "Lire les candidats",
  "candidate.update": "Modifier les candidats",
  "candidate.apply": "Postuler",
  "blog.read": "Lire le blog",
  "blog.write": "Écrire dans le blog",
  "notifications.read": "Lire les notifications",
  "notifications.manage": "Gérer les notifications",
  "services.manage": "Gérer les services",
  "dashboard.admin": "Accéder au tableau de bord admin",
  "dashboard.candidate": "Accéder au tableau de bord candidat",
  "seo.manage": "Gérer le SEO",
  "team.manage": "Gérer l’équipe",
};
