export const SERVICE_NAV_LINKS: Array<{ to: string; label: string; labelKey?: string }> = [
  { to: "/services/mise-disposition-rh", label: "Mise à disposition" },
  { to: "/services/recrutement", label: "Recrutement" },
  { to: "/services/externalisation", label: "Externalisation" },
  {
    to: "/services/conseil-formation",
    label: "Conseil & formation RH",
    labelKey: "serviceNav.consulting",
  },
];
