export function resolveConfirmationBaseUrl(
  env: Record<string, string | undefined> = process.env,
  req?: { headers?: Record<string, string | string[] | undefined> },
): string {
  const envSiteUrl = env.SITE_URL?.trim();
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const forwardedHost = req?.headers?.['x-forwarded-host'] || req?.headers?.host;

  if (envSiteUrl) {
    return envSiteUrl.replace(/\/$/, '');
  }

  if (typeof forwardedProto === 'string' && typeof forwardedHost === 'string' && forwardedHost.trim()) {
    const protocol = forwardedProto.split(',')[0].trim() || 'https';
    const host = forwardedHost.split(',')[0].trim();
    return `${protocol}://${host}`;
  }

  return 'https://emploiplus-group.com';
}
