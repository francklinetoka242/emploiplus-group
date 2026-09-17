import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  confirmPasswordReset,
  requestPasswordReset,
  validatePasswordReset,
} from "../server/password-reset-handlers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || "");
  if (action === "request") return requestPasswordReset(req, res);
  if (action === "validate") return validatePasswordReset(req, res);
  if (action === "confirm") return confirmPasswordReset(req, res);
  return res.status(400).json({ error: "Unknown password reset action" });
}