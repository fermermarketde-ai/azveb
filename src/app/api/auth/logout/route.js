import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  let refreshToken = null;

  try {
    const body = await request?.json().catch(() => ({}));
    refreshToken = body?.refreshToken;
  } catch {}

  if (!refreshToken && request?.headers) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:fmk_refresh_token|refreshToken)=([^;]+)/);
    if (match) {
      refreshToken = match[1];
    }
  }

  if (refreshToken) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    } catch {}
  }

  const res = NextResponse.json({ success: true });

  // Clear all auth cookies
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";

  res.headers.append("Set-Cookie", `fmk_access_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secureFlag}`);
  res.headers.append("Set-Cookie", `fmk_refresh_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secureFlag}`);
  res.headers.append("Set-Cookie", `accessToken=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secureFlag}`);
  res.headers.append("Set-Cookie", `token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secureFlag}`);

  return res;
}
