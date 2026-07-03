export function resolveConfirmationBaseUrl(
  env: Record<string, string | undefined> = process.env,
  req?: { headers?: Record<string, string | string[] | undefined> },
): string {
  const envSiteUrl = env.SITE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const forwardedHost = req?.headers?.['x-forwarded-host'] || req?.headers?.host;

  if (typeof forwardedProto === 'string' && typeof forwardedHost === 'string' && forwardedHost.trim()) {
    const protocol = forwardedProto.split(',')[0].trim() || 'https';
    const host = forwardedHost.split(',')[0].trim();
    return `${protocol}://${host}`;
  }

  if (envSiteUrl) {
    return envSiteUrl.replace(/\/$/, '');
  }

  return 'https://emploiplus-group.com';
}
