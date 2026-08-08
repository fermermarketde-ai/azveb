import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signAccessToken, signRefreshToken, refreshTokenExpiryDate } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request) {
  // Apply rate limiting: 5 attempts / 15 min
  const rl = rateLimit(request, { limit: 5, windowMs: 15 * 60_000, keyPrefix: "login" });
  if (rl) {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const login = body.login || "unknown";
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
      await prisma.auditLog.create({
        data: {
          action: "FAILED_LOGIN_RATE_LIMIT",
          entity: "User",
          metadata: { details: `Failed login attempt (rate limited) for login: ${login} from IP: ${ip}` },
        },
      }).catch(() => {});
    } catch {}
    return rl;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validasiya xətası", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { login, password } = parsed.data;
  const cleanLogin = login.trim();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanLogin, mode: "insensitive" } },
          { username: { equals: cleanLogin, mode: "insensitive" } },
          { phone: cleanLogin },
        ],
      },
    });
  } catch (error) {
    console.error("Database connection error in login:", error);
    return Response.json({
      error: "Verilənlər bazasına qoşulmaq mümkün olmadı. Zəhmət olmasa tənzimləmələri yoxlayın.",
      code: "DB_CONN"
    }, { status: 500 });
  }

  if (!user) {
    await prisma.auditLog.create({
      data: {
        action: "FAILED_LOGIN",
        entity: "User",
        metadata: { details: `Non-existent user attempt for login: ${cleanLogin} from IP: ${ip}` },
      },
    }).catch(() => {});
    return Response.json({ error: "İstifadəçi adı və ya şifrə yanlışdır" }, { status: 401 });
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "FAILED_LOGIN",
        entity: "User",
        entityId: user.id,
        metadata: { details: `Incorrect password attempt from IP: ${ip}` },
      },
    }).catch(() => {});
    return Response.json({ error: "İstifadəçi adı və ya şifrə yanlışdır" }, { status: 401 });
  }

  if (user.status === "SUSPENDED" || user.status === "BANNED" || user.isBanned) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "FAILED_LOGIN_SUSPENDED",
        entity: "User",
        entityId: user.id,
        metadata: { details: `Suspended/banned user attempt from IP: ${ip}` },
      },
    }).catch(() => {});
    return Response.json({ error: "Hesabınız bloklanıb. Dəstək ilə əlaqə saxlayın." }, { status: 403 });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  try {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiryDate(),
      },
    });
  } catch (err) {
    console.error("Failed to save refresh token:", err);
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { details: `Successful login from IP: ${ip}` },
    },
  }).catch(() => {});

  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";

  const res = Response.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      locale: user.locale,
      status: user.status,
    },
    accessToken,
    refreshToken,
  });

  res.headers.append(
    "Set-Cookie",
    `fmk_access_token=${accessToken}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly${secureFlag}`
  );
  res.headers.append(
    "Set-Cookie",
    `fmk_refresh_token=${refreshToken}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly${secureFlag}`
  );

  return res;
}
