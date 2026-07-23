import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type UnknownRecord = Record<string, unknown>;

function normalizeRequestBody(req: VercelRequest) {
  const rawBody = req.body;

  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }

  if (rawBody && typeof rawBody === "object") {
    return rawBody as unknown;
  }

  return undefined;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") || "";
  if (
    contentType.includes("application/json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function normalizeErrorMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  if (typeof value === "object" && value !== null) {
    const record = value as UnknownRecord;
    if (typeof record.msg === "string") return record.msg;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;

    const nestedError = record.error as UnknownRecord | undefined;
    if (nestedError && typeof nestedError.msg === "string") return nestedError.msg;
    if (nestedError && typeof nestedError.message === "string") return nestedError.message;

    return JSON.stringify(record);
  }

  return String(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: "Server misconfiguration: missing Supabase credentials" });
  }

  const requestBody = normalizeRequestBody(req);
  const method = String(req.method || "GET").toUpperCase();
  const query = req.query as Record<string, unknown> & { get?: (key: string) => string | null };
  const id = typeof query?.get === "function" ? query.get("id") ?? undefined : typeof query?.id === "string" ? query.id : undefined;

  const restHeaders = {
    "Content-Type": "application/json",
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Prefer: "return=representation",
  };

  if (method === "GET") {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/faqs?select=id,question,answer,category,sort_order,created_at,updated_at&order=sort_order.asc`, {
      method: "GET",
      headers: restHeaders,
    });

    const body = await readResponseBody(response);
    if (!response.ok) {
      return res.status(response.status).json({ error: normalizeErrorMessage(body) });
    }

    return res.status(200).json({ data: Array.isArray(body) ? body : [] });
  }

  if (method === "POST") {
    const payload = Array.isArray(requestBody)
      ? requestBody
      : requestBody && typeof requestBody === "object"
        ? [requestBody]
        : [];

    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/faqs`, {
      method: "POST",
      headers: restHeaders,
      body: JSON.stringify(payload),
    });

    const body = await readResponseBody(response);
    if (!response.ok) {
      return res.status(response.status).json({ error: normalizeErrorMessage(body) });
    }

    return res.status(201).json({ data: Array.isArray(body) ? body[0] ?? null : body ?? null });
  }

  if (method === "PUT") {
    if (!id) {
      return res.status(400).json({ error: "Missing FAQ id" });
    }

    const payload = requestBody && typeof requestBody === "object" && !Array.isArray(requestBody)
      ? (requestBody as UnknownRecord)
      : {};

    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/faqs?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: restHeaders,
      body: JSON.stringify(payload),
    });

    const body = await readResponseBody(response);
    if (!response.ok) {
      return res.status(response.status).json({ error: normalizeErrorMessage(body) });
    }

    return res.status(200).json({ data: Array.isArray(body) ? body[0] ?? null : body ?? null });
  }

  if (method === "DELETE") {
    if (!id) {
      return res.status(400).json({ error: "Missing FAQ id" });
    }

    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/faqs?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: restHeaders,
    });

    const body = await readResponseBody(response);
    if (!response.ok) {
      return res.status(response.status).json({ error: normalizeErrorMessage(body) });
    }

    return res.status(200).json({ data: body ?? null });
  }

  res.setHeader("Allow", "GET,POST,PUT,DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
