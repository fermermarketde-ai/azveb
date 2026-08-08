import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export function validateJwtSecrets() {
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  if (!accessSecret) {
    throw new Error("CRITICAL: JWT_ACCESS_SECRET (or JWT_SECRET) must be set in environment variables.");
  }
  if (!refreshSecret) {
    throw new Error("CRITICAL: JWT_REFRESH_SECRET (or JWT_SECRET) must be set in environment variables.");
  }

  return { accessSecret, refreshSecret };
}

function getAccessSecret() {
  return validateJwtSecrets().accessSecret;
}

function getRefreshSecret() {
  return validateJwtSecrets().refreshSecret;
}

const ACCESS_TOKEN_TTL = "7d";
const REFRESH_TOKEN_TTL_DAYS = 30;

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    getAccessSecret(),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    getRefreshSecret(),
    { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` }
  );
}

export function refreshTokenExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}

export function verifyAccessToken(token) {
  if (!token) return null;
  const secret = getAccessSecret();
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  if (!token) return null;
  const secret = getRefreshSecret();
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the bearer token from a Next.js Request.
 * Returns the decoded payload or null.
 */
export async function getAuthUser(request) {
  if (!request) return null;

  let token = null;

  // 1. Try Authorization: Bearer header
  const authHeader = request.headers?.get("authorization") || "";
  const [scheme, bearerToken] = authHeader.split(" ");
  if (scheme === "Bearer" && bearerToken) {
    token = bearerToken;
  }

  // 2. Fallback: try HttpOnly cookies
  if (!token) {
    const cookieHeader = request.headers?.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:fmk_access_token|accessToken|token)=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) return null;

  let payload = verifyAccessToken(token);

  // 3. Fallback: if access token expired/invalid, try refresh token cookie
  if (!payload) {
    const cookieHeader = request.headers?.get("cookie") || "";
    const refreshMatch = cookieHeader.match(/(?:^|;\s*)(?:fmk_refresh_token|refreshToken)=([^;]+)/);
    if (refreshMatch) {
      const refreshPayload = verifyRefreshToken(refreshMatch[1]);
      if (refreshPayload) {
        payload = refreshPayload;
      }
    }
  }

  if (!payload) return null;

  // Always look up the user's current role from the DB — the JWT's role
  // field is a snapshot from sign time and can be stale if an admin changed
  // the role since the token was issued. This ensures role changes take
  // effect on the user's very next API call, no logout needed.
  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, email: true, status: true, isBanned: true },
    });
    if (!user) return null;
    if (user.status === "BANNED" || user.status === "SUSPENDED" || user.isBanned) return null;
    return { ...payload, role: user.role, email: user.email };
  } catch {
    // If DB is unreachable, fall back to JWT payload (better than blocking all APIs)
    if (payload.status === "BANNED" || payload.status === "SUSPENDED" || payload.isBanned) return null;
    return payload;
  }
}

export function generatePasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken) {
  if (!rawToken) return "";
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function requireRole(authUser, allowedRoles) {
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!allowedRoles || !allowedRoles.includes(authUser.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export const getTokenFromRequest = getAuthUser;
export const verifyToken = verifyAccessToken;
