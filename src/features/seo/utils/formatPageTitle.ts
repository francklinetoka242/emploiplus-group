function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

export function formatPageTitle(title: string, brand: string): string {
  const cleanTitle = title.trim();
  const cleanBrand = brand.trim();
  if (!cleanTitle) return cleanBrand;
  if (!cleanBrand) return cleanTitle;

  const normalizedTitle = normalizeForComparison(cleanTitle);
  const normalizedBrand = normalizeForComparison(cleanBrand);
  return normalizedTitle.includes(normalizedBrand) ? cleanTitle : `${cleanTitle} | ${cleanBrand}`;
}

export function getOpenGraphImageType(imageUrl: string): string | null {
  const path = imageUrl.split(/[?#]/, 1)[0].toLowerCase();
  const extension = path.slice(path.lastIndexOf(".") + 1);
  const types: Record<string, string> = {
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return types[extension] ?? null;
}
