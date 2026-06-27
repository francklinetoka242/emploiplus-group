export const SERVICES = [
  {
    slug: "job-broadcast",
    titleKey: "services.card1.title",
    descriptionKey: "services.card1.description",
    detailKey: "services.card1.detail",
  },
  {
    slug: "web-development",
    titleKey: "services.card2.title",
    descriptionKey: "services.card2.description",
    detailKey: "services.card2.detail",
  },
  {
    slug: "media-strategy",
    titleKey: "services.card3.title",
    descriptionKey: "services.card3.description",
    detailKey: "services.card3.detail",
  },
  {
    slug: "employer-branding",
    titleKey: "services.card4.title",
    descriptionKey: "services.card4.description",
    detailKey: "services.card4.detail",
  },
  {
    slug: "digital-consulting",
    titleKey: "services.card5.title",
    descriptionKey: "services.card5.description",
    detailKey: "services.card5.detail",
  },
  {
    slug: "operational-support",
    titleKey: "services.card6.title",
    descriptionKey: "services.card6.description",
    detailKey: "services.card6.detail",
  },
];

export function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}
