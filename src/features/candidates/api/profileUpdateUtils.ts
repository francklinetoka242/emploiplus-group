function normalizeCandidateName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveRequiredName(value: unknown, fallbackValue: unknown, fallback = "Candidat") {
  const normalizedValue = normalizeCandidateName(value);
  if (normalizedValue) return normalizedValue;

  const normalizedFallback = normalizeCandidateName(fallbackValue);
  if (normalizedFallback) return normalizedFallback;

  return fallback;
}

export function buildCandidateProfileUpdatePayload(
  updates: Record<string, unknown> | null | undefined,
  currentProfile?: Partial<Record<"first_name" | "last_name", unknown>> | null,
) {
  const payload: Record<string, unknown> = {};

  if (!updates) {
    return payload;
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (key === "first_name") {
      payload.first_name = resolveRequiredName(value, currentProfile?.first_name, "Candidat");
      return;
    }

    if (key === "last_name") {
      payload.last_name = resolveRequiredName(value, currentProfile?.last_name, "Candidat");
      return;
    }

    payload[key] = value;
  });

  if (!Object.prototype.hasOwnProperty.call(payload, "first_name")) {
    payload.first_name = resolveRequiredName(currentProfile?.first_name, null, "Candidat");
  }

  if (!Object.prototype.hasOwnProperty.call(payload, "last_name")) {
    payload.last_name = resolveRequiredName(currentProfile?.last_name, null, "Candidat");
  }

  return payload;
}
