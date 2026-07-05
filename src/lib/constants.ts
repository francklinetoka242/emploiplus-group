export const SERVICES = [
  {
    slug: "hub-emploi-recrutement",
    titleKey: "services.card1.title",
    descriptionKey: "services.card1.description",
    detailKey: "services.card1.detail",
  },
  {
    slug: "mise-disposition-rh",
    titleKey: "services.card2.title",
    descriptionKey: "services.card2.description",
    detailKey: "services.card2.detail",
  },
  {
    slug: "conseil-formation-transformation",
    titleKey: "services.card3.title",
    descriptionKey: "services.card3.description",
    detailKey: "services.card3.detail",
  },
  {
    slug: "prestations-operationnelles",
    titleKey: "services.card4.title",
    descriptionKey: "services.card4.description",
    detailKey: "services.card4.detail",
  },
];

export function createSlug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`
  );
}
