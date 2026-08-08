import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken, refreshTokenExpiryDate } from "@/lib/auth";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {}

  let refreshToken = body?.refreshToken;

  // Fallback to HttpOnly cookie if refreshToken not provided in JSON body
  if (!refreshToken) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:fmk_refresh_token|refreshToken)=([^;]+)/);
    if (match) {
      refreshToken = match[1];
    }
  }

  if (!refreshToken) {
    return Response.json({ error: "refreshToken tələb olunur" }, { status: 400 });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return Response.json({ error: "Refresh token etibarsızdır və ya vaxtı bitib" }, { status: 401 });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return Response.json({ error: "Refresh token etibarsızdır və ya vaxtı bitib" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status === "SUSPENDED" || user.status === "BANNED" || user.isBanned) {
    return Response.json({ error: "Hesab tapılmadı və ya bloklanıb" }, { status: 401 });
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  // Rotate/update refresh token in database
  try {
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        token: newRefreshToken,
        expiresAt: refreshTokenExpiryDate(),
      },
    });
  } catch {
    // If update failed, create new refresh token record
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiryDate(),
      },
    }).catch(() => {});
  }

  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";

  const res = Response.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      locale: user.locale,
      status: user.status,
    },
  });

  res.headers.append(
    "Set-Cookie",
    `fmk_access_token=${newAccessToken}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly${secureFlag}`
  );
  res.headers.append(
    "Set-Cookie",
    `fmk_refresh_token=${newRefreshToken}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly${secureFlag}`
  );

  return res;
}
