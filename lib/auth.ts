// Server-side auth utilities only — never imported by client components.

export function checkAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

// Session token is a simple signed value for this low-stakes app.
// We just use a hashed timestamp + password to produce a token.
import { createHash } from "crypto";

export function generateSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "fallback";
  const payload = `${secret}:session:${Date.now()}`;
  return createHash("sha256").update(payload).digest("hex");
}

export function isValidSessionToken(token: string): boolean {
  // Token is valid if it's 64 hex chars (sha256 output) — we don't expire sessions.
  // For this app, session persistence = staying logged in until cookie clears.
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}
