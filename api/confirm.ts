import "dotenv/config";
import { createHmac } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
// Local base64url helpers to avoid runtime dependency on utils/token
function base64url(input: string | Buffer) {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input;

  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");

  return Buffer.from(normalized, "base64").toString("utf8");
}

async function resolveSupabaseUserIdByEmail(
  fetchImpl: typeof fetch,
  supabaseUrl: string,
  serviceKey: string,
  email: string,
) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users?email=eq.${encodeURIComponent(email)}`;
  const headers = {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  const response = await fetchImpl(url, {
    method: "GET",
    headers,
  });

  const bodyText = await response.text();
  if (!response.ok) {
    console.warn("[CONFIRM-DEBUG][confirm-utils] resolveUserIdByEmail failed", {
      status: response.status,
      body: bodyText,
    });
    return null;
  }

  try {
    const parsedBody = JSON.parse(bodyText) as Array<Record<string, unknown>>;
    const firstUser = Array.isArray(parsedBody) ? parsedBody[0] : undefined;
    if (firstUser && typeof firstUser.id === "string" && firstUser.id) {
      return firstUser.id;
    }
  } catch (error) {
    console.warn("[CONFIRM-DEBUG][confirm-utils] resolveUserIdByEmail parse failed", error);
  }

  return null;
}

async function updateSupabaseUserConfirmation(
  fetchImpl: typeof fetch,
  supabaseUrl: string,
  userId: string,
  serviceKey: string,
  confirmedAt: string,
) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users/${userId}`;
  const headers = {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  const requestBody = JSON.stringify({
    email_confirm: true,
  });
  console.log("[CONFIRM-DEBUG][confirm-utils] request", { url, method: "PUT", body: requestBody });

  const putResponse = await fetchImpl(url, {
    method: "PUT",
    headers,
    body: requestBody,
  });

  const putBody = await putResponse.text();
  console.log("[CONFIRM-DEBUG][confirm-utils] response", {
    status: putResponse.status,
    body: putBody,
  });

  if (putResponse.ok) {
    return {
      ok: putResponse.ok,
      status: putResponse.status,
      statusText: putResponse.statusText,
      text: async () => putBody,
    };
  }

  if (putResponse.status === 405 || putResponse.status === 404) {
    console.log("[CONFIRM-DEBUG][confirm-utils] retryingWithPatch", { url, body: requestBody });
    const patchResponse = await fetchImpl(url, {
      method: "PATCH",
      headers,
      body: requestBody,
    });
    const patchBody = await patchResponse.text();
    console.log("[CONFIRM-DEBUG][confirm-utils] patchResponse", {
      status: patchResponse.status,
      body: patchBody,
    });

    return {
      ok: patchResponse.ok,
      status: patchResponse.status,
      statusText: patchResponse.statusText,
      text: async () => patchBody,
    };
  }

  return {
    ok: putResponse.ok,
    status: putResponse.status,
    statusText: putResponse.statusText,
    text: async () => putBody,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.query.token || "");
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET?.trim();
  if (!EMAIL_SIGNING_SECRET) {
    throw new Error("EMAIL_SIGNING_SECRET missing");
  }
  const confirmationBaseUrl = process.env.SITE_URL || "https://www.emploiplus-group.com";

  if (!token || !SUPABASE_URL || !SERVICE_KEY) {
    return res.status(400).send("Invalid confirmation request");
  }
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return res.status(400).send("Invalid confirmation token");
  }

  const expectedSignature = base64url(
    createHmac("sha256", EMAIL_SIGNING_SECRET).update(payloadEncoded).digest(),
  );
  if (expectedSignature !== signature) {
    console.error("Confirmation token signature mismatch");
    return res.status(400).send("Invalid or expired token");
  }

  let payload: Record<string, unknown> | null = null;
  try {
    const decoded = base64urlDecode(payloadEncoded);
    payload = JSON.parse(decoded) as Record<string, unknown>;
    console.log("DECODED PAYLOAD", payload);
  } catch (error) {
    console.error("Failed to parse confirmation token", error);
    return res.status(400).send("Invalid token payload");
  }

  const payloadSub = typeof payload?.sub === "string" ? payload.sub : undefined;
  const payloadEmail = typeof payload?.email === "string" ? payload.email : undefined;
  const payloadExp = typeof payload?.exp === "number" ? payload.exp : undefined;
  if (!payloadSub || payloadExp === undefined) {
    return res.status(400).send("Invalid token payload");
  }

  if (Math.floor(Date.now() / 1000) > payloadExp) {
    return res.status(400).send("Token expired");
  }

  try {
    const resolvedUserId = payloadEmail
      ? await resolveSupabaseUserIdByEmail(fetch, SUPABASE_URL, SERVICE_KEY, payloadEmail)
      : null;
    const effectiveUserId = resolvedUserId || payloadSub;

    console.log("[CONFIRM-DEBUG][confirm] supabaseUpdateRequest", {
      url: `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/admin/users/${effectiveUserId}`,
      method: "PUT/PATCH",
      payload: { email_confirmed_at: new Date().toISOString() },
      resolvedFromEmail: Boolean(resolvedUserId),
      originalSub: payloadSub,
      email: payloadEmail,
    });

    const confirmResp = await updateSupabaseUserConfirmation(
      fetch,
      SUPABASE_URL,
      effectiveUserId,
      SERVICE_KEY,
      new Date().toISOString(),
    );

    const body = await confirmResp.text();
    const parsedBody = JSON.parse(body);

    console.log("[CONFIRM-DEBUG] email_confirmed_at", parsedBody.email_confirmed_at);

    console.log("[CONFIRM-DEBUG] confirmed_at", parsedBody.confirmed_at);

    console.log(
      "[CONFIRM-DEBUG] email_verified",
      parsedBody.identities?.[0]?.identity_data?.email_verified,
    );

    console.log("[CONFIRM-DEBUG] fullResponse", parsedBody);

    console.log("[CONFIRM-DEBUG][confirm] supabaseUpdateResponse", {
      status: confirmResp.status,
      body,
    });

    if (!confirmResp.ok) {
      console.error("Supabase confirm failed", confirmResp.status, body);
      return res.status(confirmResp.status).send(`Confirmation failed: ${body || "Unknown error"}`);
    }

    console.log(
      "[CONFIRM-DEBUG][confirm] redirectUrl",
      `${confirmationBaseUrl}/candidate/login?confirmed=true`,
    );
    return res.redirect(`${confirmationBaseUrl}/candidate/login?confirmed=true`);
  } catch (error) {
    console.error("[CONFIRM-DEBUG][confirm] exception", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).send("Server error");
  }
}
