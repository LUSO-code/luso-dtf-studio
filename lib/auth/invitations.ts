import crypto from "crypto";

/**
 * Generates a secure random 64-character hex invitation token.
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes a deterministic SHA-256 hash of an invitation token.
 */
export function hashInvitationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Computes invitation expiration date (default 7 days).
 */
export function getInvitationExpiration(days: number = 7): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
