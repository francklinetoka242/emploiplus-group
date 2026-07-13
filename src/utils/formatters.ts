export function formatDate(iso: string | null | undefined, locale: "fr" | "en" = "fr") {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
