type JobOfferOrderFields = {
  deadline: string | null;
  expires_at: string | null;
  publish_at: string | null;
  created_at: string | null;
};

export function isJobOfferExpired(
  offer: Pick<JobOfferOrderFields, "deadline" | "expires_at">,
  now = Date.now(),
): boolean {
  const expirationDate = offer.deadline || offer.expires_at;
  if (!expirationDate) return false;

  const expirationTime = new Date(expirationDate).getTime();
  return Number.isFinite(expirationTime) && expirationTime < now;
}

export function compareJobOffersByValidityThenDate(
  left: JobOfferOrderFields,
  right: JobOfferOrderFields,
): number {
  const validityOrder = Number(isJobOfferExpired(left)) - Number(isJobOfferExpired(right));
  if (validityOrder !== 0) return validityOrder;

  const leftDate = new Date(left.publish_at ?? left.created_at ?? 0).getTime();
  const rightDate = new Date(right.publish_at ?? right.created_at ?? 0).getTime();
  if (leftDate !== rightDate) return rightDate - leftDate;

  return (right.publish_at ?? right.created_at ?? "").localeCompare(
    left.publish_at ?? left.created_at ?? "",
  );
}
