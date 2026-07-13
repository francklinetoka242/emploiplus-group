export async function resendConfirmationEmail(email: string) {
  const response = await fetch("/api/resend-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw body?.error ? new Error(body.error) : new Error("Impossible de renvoyer l'email de confirmation.");
  }

  return { success: true };
}
