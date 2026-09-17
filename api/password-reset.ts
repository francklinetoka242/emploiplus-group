import type { VercelRequest, VercelResponse } from "@vercel/node";
import requestHandler from "./lib/password-reset-request";
import validateHandler from "./lib/password-reset-validate";
import confirmHandler from "./lib/password-reset-confirm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || "");
  if (action === "request") return requestHandler(req, res);
  if (action === "validate") return validateHandler(req, res);
  if (action === "confirm") return confirmHandler(req, res);
  return res.status(400).json({ error: "Unknown password reset action" });
}