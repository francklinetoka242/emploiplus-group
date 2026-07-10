export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  preview: string;
  premium: boolean;
}

const buildPreviewSvg = (name: string, accent: string, secondary: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <rect width="1200" height="900" rx="36" fill="#f8fafc" />
      <rect x="40" y="40" width="360" height="820" rx="28" fill="#0f172a" />
      <circle cx="220" cy="170" r="78" fill="${accent}" />
      <rect x="120" y="292" width="200" height="18" rx="9" fill="#e2e8f0" />
      <rect x="120" y="330" width="170" height="14" rx="7" fill="#94a3b8" />
      <rect x="90" y="420" width="260" height="12" rx="6" fill="#334155" />
      <rect x="90" y="450" width="220" height="12" rx="6" fill="#334155" />
      <rect x="90" y="480" width="240" height="12" rx="6" fill="#334155" />
      <rect x="90" y="560" width="200" height="12" rx="6" fill="#334155" />
      <rect x="90" y="590" width="180" height="12" rx="6" fill="#334155" />
      <rect x="446" y="92" width="590" height="140" rx="24" fill="white" />
      <rect x="478" y="124" width="220" height="24" rx="12" fill="${accent}" />
      <rect x="478" y="166" width="340" height="16" rx="8" fill="#64748b" />
      <rect x="446" y="268" width="280" height="190" rx="24" fill="white" />
      <rect x="478" y="300" width="200" height="18" rx="9" fill="#0f172a" />
      <rect x="478" y="336" width="170" height="12" rx="6" fill="#64748b" />
      <rect x="478" y="368" width="210" height="12" rx="6" fill="#cbd5e1" />
      <rect x="478" y="392" width="190" height="12" rx="6" fill="#cbd5e1" />
      <rect x="758" y="268" width="278" height="190" rx="24" fill="white" />
      <rect x="790" y="300" width="140" height="18" rx="9" fill="${secondary}" />
      <rect x="790" y="336" width="180" height="12" rx="6" fill="#64748b" />
      <rect x="790" y="360" width="160" height="12" rx="6" fill="#cbd5e1" />
      <rect x="446" y="492" width="590" height="240" rx="24" fill="white" />
      <rect x="478" y="530" width="180" height="20" rx="10" fill="#0f172a" />
      <rect x="478" y="570" width="480" height="12" rx="6" fill="#cbd5e1" />
      <rect x="478" y="598" width="430" height="12" rx="6" fill="#cbd5e1" />
      <rect x="478" y="626" width="390" height="12" rx="6" fill="#cbd5e1" />
      <rect x="478" y="660" width="180" height="34" rx="17" fill="${accent}" />
      <text x="70" y="790" fill="#f8fafc" font-family="Segoe UI, Arial" font-size="22">${name}</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const buildCorporatePreviewSvg = (name: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <rect width="1200" height="900" rx="36" fill="#f8fafc" />
      <rect x="40" y="40" width="360" height="820" rx="28" fill="#0f172a" />
      <circle cx="220" cy="170" r="78" fill="#e2e8f0" />
      <circle cx="220" cy="170" r="68" fill="#ffffff" />
      <path d="M180 220 Q220 260 260 220" fill="#94a3b8" />
      <rect x="100" y="320" width="240" height="18" rx="9" fill="#e2e8f0" />
      <rect x="100" y="356" width="170" height="14" rx="7" fill="#cbd5e1" />
      <rect x="100" y="408" width="220" height="12" rx="6" fill="#94a3b8" />
      <rect x="100" y="434" width="190" height="12" rx="6" fill="#94a3b8" />
      <rect x="100" y="464" width="210" height="12" rx="6" fill="#94a3b8" />
      <rect x="100" y="514" width="150" height="12" rx="6" fill="#94a3b8" />
      <rect x="100" y="544" width="180" height="12" rx="6" fill="#94a3b8" />
      <rect x="100" y="594" width="220" height="12" rx="6" fill="#94a3b8" />
      <rect x="100" y="674" width="240" height="12" rx="6" fill="#94a3b8" />
      <rect x="460" y="80" width="680" height="180" rx="30" fill="#ffffff" />
      <rect x="520" y="116" width="380" height="22" rx="11" fill="#0f172a" />
      <rect x="520" y="154" width="260" height="16" rx="8" fill="#475569" />
      <rect x="520" y="186" width="420" height="12" rx="6" fill="#64748b" />
      <rect x="520" y="214" width="340" height="12" rx="6" fill="#cbd5e1" />
      <rect x="460" y="292" width="360" height="170" rx="24" fill="#ffffff" />
      <rect x="520" y="324" width="240" height="18" rx="9" fill="#0f172a" />
      <rect x="520" y="356" width="200" height="12" rx="6" fill="#64748b" />
      <rect x="520" y="380" width="270" height="12" rx="6" fill="#cbd5e1" />
      <rect x="520" y="404" width="220" height="12" rx="6" fill="#cbd5e1" />
      <rect x="460" y="500" width="360" height="200" rx="24" fill="#ffffff" />
      <rect x="520" y="534" width="220" height="18" rx="9" fill="#0f172a" />
      <rect x="520" y="566" width="200" height="12" rx="6" fill="#64748b" />
      <rect x="520" y="590" width="280" height="12" rx="6" fill="#cbd5e1" />
      <rect x="520" y="614" width="240" height="12" rx="6" fill="#cbd5e1" />
      <rect x="460" y="724" width="680" height="110" rx="24" fill="#ffffff" />
      <rect x="520" y="756" width="260" height="18" rx="9" fill="#0f172a" />
      <rect x="520" y="786" width="300" height="12" rx="6" fill="#64748b" />
      <rect x="520" y="812" width="190" height="12" rx="6" fill="#cbd5e1" />
      <text x="70" y="790" fill="#f8fafc" font-family="Segoe UI, Arial" font-size="22">${name}</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const cvTemplates: CVTemplate[] = [
  {
    id: "professionnel-violet",
    name: "Professionnel Violet",
    description: "CV professionnel moderne avec formulaire interactif, prévisualisation en temps réel et export PDF.",
    category: "Professionnel",
    thumbnail: buildPreviewSvg("Professionnel Violet", "#6d28d9", "#f3eefd"),
    preview: buildPreviewSvg("Professionnel Violet", "#6d28d9", "#f3eefd"),
    premium: false,
  },
  {
    id: "professionnel-corporate",
    name: "Professionnel Corporate",
    description: "CV corporate clair avec section contact latérale, en-tête fort et mise en page élégante.",
    category: "Professionnel",
    thumbnail: buildCorporatePreviewSvg("Corporate"),
    preview: buildCorporatePreviewSvg("Corporate"),
    premium: false,
  },
  {
    id: "professionnel-beige",
    name: "Professionnel Beige",
    description: "CV beige élégant avec en-tête détaillé, sections séparées et style chaleureux.",
    category: "Professionnel",
    thumbnail: buildPreviewSvg("Professionnel Beige", "#a77b5f", "#f0e5dc"),
    preview: buildPreviewSvg("Professionnel Beige", "#a77b5f", "#f0e5dc"),
    premium: false,
  },
];

export const cvTemplateCategories = ["Tous", "Professionnel"] as const;

export const getCvTemplateById = (templateId?: string | null) =>
  cvTemplates.find((template) => template.id === templateId) ?? cvTemplates[0];
