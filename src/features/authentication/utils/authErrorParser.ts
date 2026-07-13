const getStringValue = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
};

export function parseAuthErrorMessage(error: unknown): string {
  if (error == null) {
    return "Une erreur est survenue";
  }

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed || "Une erreur est survenue";
  }

  if (error instanceof Error) {
    const errorMessage = error.message?.trim();
    if (errorMessage && errorMessage !== "{}" && errorMessage !== "[]") {
      return errorMessage;
    }
  }

  const errorRecord = error as Record<string, unknown>;
  const candidates = [
    errorRecord.message,
    errorRecord.error_description,
    errorRecord.code,
    errorRecord.error,
    errorRecord.name,
    errorRecord.details,
    errorRecord.hint,
    typeof errorRecord.status === "number" ? `Erreur ${errorRecord.status}` : null,
    (errorRecord.body as { error?: unknown } | undefined)?.error,
    (errorRecord.body as { message?: unknown } | undefined)?.message,
    (errorRecord.data as { message?: unknown } | undefined)?.message,
    (errorRecord.data as { error?: unknown } | undefined)?.error,
    (errorRecord.response as { data?: { message?: unknown; error?: unknown } } | undefined)?.data?.message,
    (errorRecord.response as { data?: { message?: unknown; error?: unknown } } | undefined)?.data?.error,
  ];

  for (const candidate of candidates) {
    const value = getStringValue(candidate);
    if (value) {
      return value;
    }
  }

  if (typeof error === "object" && error !== null) {
    const errorWithToJson = error as { toJSON?: () => unknown };
    if (typeof errorWithToJson.toJSON === "function") {
      try {
        const jsonData = errorWithToJson.toJSON();
        if (jsonData && typeof jsonData === "object") {
          const parsedKeys = Object.entries(jsonData)
            .map(([key, value]) => {
              const stringValue = getStringValue(value);
              return stringValue ? `${key}: ${stringValue}` : null;
            })
            .filter(Boolean);
          if (parsedKeys.length > 0) {
            return parsedKeys.join(", ");
          }
        }
      } catch {
        // ignored
      }
    }

    try {
      const json = JSON.stringify(error);
      if (json && json !== "{}" && json !== "[]") {
        return json;
      }
    } catch {
      // ignored
    }

    const props = Object.getOwnPropertyNames(error)
      .map((key) => {
        const value = (error as Record<string, unknown>)[key];
        const stringValue = getStringValue(value);
        return stringValue ? `${key}: ${stringValue}` : null;
      })
      .filter(Boolean);

    if (props.length > 0) {
      return props.join(", ");
    }
  }

  return "Une erreur est survenue";
}
