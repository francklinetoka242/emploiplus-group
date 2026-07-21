export function buildAdminCreateUserPayload(
  email: string,
  password: string,
  metadata: Record<string, string | boolean | number | null | undefined>,
) {
  return {
    email,
    password,
    email_confirm: true,
    user_metadata: Object.fromEntries(
      Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null),
    ),
  };
}
