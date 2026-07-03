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

  const requestBody = JSON.stringify({ email_confirmed_at: confirmedAt });
  console.log('[CONFIRM-DEBUG][confirm-utils] request', { url, method: 'PUT', body: requestBody });

  const putResponse = await fetchImpl(url, {
    method: 'PUT',
    headers,
    body: requestBody,
  });

  const putBody = await putResponse.text();
  console.log('[CONFIRM-DEBUG][confirm-utils] response', { status: putResponse.status, body: putBody });

  if (putResponse.ok) {
    return {
      ok: putResponse.ok,
      status: putResponse.status,
      text: async () => putBody,
    };
  }

  if (putResponse.status === 405 || putResponse.status === 404) {
    console.log('[CONFIRM-DEBUG][confirm-utils] retryingWithPatch', { url, body: requestBody });
    const patchResponse = await fetchImpl(url, {
      method: 'PATCH',
      headers,
      body: requestBody,
    });
    const patchBody = await patchResponse.text();
    console.log('[CONFIRM-DEBUG][confirm-utils] patchResponse', { status: patchResponse.status, body: patchBody });

    return {
      ok: patchResponse.ok,
      status: patchResponse.status,
      text: async () => patchBody,
    };
  }

  return {
    ok: putResponse.ok,
    status: putResponse.status,
    text: async () => putBody,
  };
}
