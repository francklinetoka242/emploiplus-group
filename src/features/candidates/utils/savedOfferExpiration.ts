export const SAVED_OFFER_EXPIRATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isSavedOfferExpiringSoon(expiration: string | null | undefined, nowMs: number): boolean {
  if (!expiration) return false;

  const expirationMs = new Date(expiration).getTime();
  if (Number.isNaN(expirationMs)) return false;

  const diffMs = expirationMs - nowMs;
  return diffMs > 0 && diffMs <= SAVED_OFFER_EXPIRATION_WINDOW_MS;
}

export function savedOfferExpirationKey(userId: string, jobOfferId: string, expiration: string): string {
  return `${userId}:${jobOfferId}:${expiration}`;
}