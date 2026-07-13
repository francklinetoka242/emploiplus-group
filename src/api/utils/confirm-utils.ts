type ConfirmationResponse = {
  ok: boolean;
  status: number;
  statusText?: string;
  text: () => Promise<string>;
};

export async function updateSupabaseUserConfirmation(
  fetchImpl: typeof fetch,
  supabaseUrl: string,
  userId: string,
  serviceKey: string,
  confirmedAt: string,
): Promise<ConfirmationResponse> {
  const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users/${userId}`;
  const headers = {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  const requestBody = JSON.stringify({ email_confirmed_at: confirmedAt });
  console.log("[CONFIRM-DEBUG][confirm-utils] request", { url, method: "PUT", body: requestBody });

  const putResponse = await fetchImpl(url, {
    method: "PUT",
    headers,
    body: requestBody,
  });

  console.log("[CONFIRM-DEBUG][confirm-utils] response", {
    status: putResponse.status,
  });

  if (putResponse.ok) {
    return putResponse;
  }

  if (putResponse.status === 405 || putResponse.status === 404) {
    console.log("[CONFIRM-DEBUG][confirm-utils] retryingWithPatch", { url, body: requestBody });
    const patchResponse = await fetchImpl(url, {
      method: "PATCH",
      headers,
      body: requestBody,
    });
    console.log("[CONFIRM-DEBUG][confirm-utils] patchResponse", {
      status: patchResponse.status,
    });

    return patchResponse;
  }

  return putResponse;
}
