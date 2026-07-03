type ConfirmationResponse = Pick<Response, 'ok' | 'status' | 'text'>;

export async function updateSupabaseUserConfirmation(
  fetchImpl: typeof fetch,
  supabaseUrl: string,
  userId: string,
  serviceKey: string,
  confirmedAt: string,
): Promise<ConfirmationResponse> {
  const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`;
  const headers = {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  const putResponse = await fetchImpl(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ email_confirmed_at: confirmedAt }),
  });

  if (putResponse.ok) {
    return putResponse;
  }

  if (putResponse.status === 405 || putResponse.status === 404) {
    const patchResponse = await fetchImpl(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ email_confirmed_at: confirmedAt }),
    });

    return patchResponse;
  }

  return putResponse;
}
