import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAccessToken, signRefreshToken, refreshTokenExpiryDate } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request) {
  // Apply rate limiting: 3 attempts / hour
  const rl = rateLimit(request, { limit: 3, windowMs: 60 * 60_000, keyPrefix: "register" });
  if (rl) return rl;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validasiya xətası", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, username, password, fullName, phone, locale } = parsed.data;
  const role = "BUYER"; // Default role forced to BUYER

  const cleanEmail = email?.trim() || null;
  const cleanPhone = phone?.trim() || null;
  const cleanUsername = username?.trim() || null;

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          cleanEmail ? { email: { equals: cleanEmail, mode: "insensitive" } } : null,
          cleanPhone ? { phone: cleanPhone } : null,
          cleanUsername ? { username: { equals: cleanUsername, mode: "insensitive" } } : null,
        ].filter(Boolean),
      },
    });

    if (existing) {
      if (cleanEmail && existing.email?.toLowerCase() === cleanEmail.toLowerCase()) {
        return Response.json({ error: "Bu e-poçt artıq qeydiyyatdan keçib" }, { status: 409 });
      }
      if (cleanPhone && existing.phone === cleanPhone) {
        return Response.json({ error: "Bu telefon nömrəsi artıq qeydiyyatdan keçib" }, { status: 409 });
      }
      if (cleanUsername && existing.username?.toLowerCase() === cleanUsername.toLowerCase()) {
        return Response.json({ error: "Bu istifadəçi adı artıq qeydiyyatdan keçib" }, { status: 409 });
      }
      return Response.json({ error: "Bu istifadəçi artıq mövcuddur" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: cleanPhone,
        username: cleanUsername,
        passwordHash,
        fullName,
        role,
        locale: locale || "az",
        status: "PENDING_VERIFICATION",
        wallet: {
          create: {
            coins: 50,
            transactions: {
              create: [
                {
                  type: "COIN_GIFT",
                  amount: 50,
                  description: "Qeydiyyat hədiyyəsi",
                },
              ],
            },
          },
        },
      },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiryDate(),
      },
    });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        metadata: { details: `Registered from IP: ${ip}` },
      },
    }).catch(() => {});

    // Send welcome email asynchronously
    if (user.email) {
      sendWelcomeEmail({ to: user.email, fullName: user.fullName }).catch(() => {});
    }

    const isProd = process.env.NODE_ENV === "production";
    const secureFlag = isProd ? "; Secure" : "";

    const res = Response.json(
      {
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
      },
      { status: 201 }
    );

    res.headers.append(
      "Set-Cookie",
      `fmk_access_token=${accessToken}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly${secureFlag}`
    );
    res.headers.append(
      "Set-Cookie",
      `fmk_refresh_token=${refreshToken}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly${secureFlag}`
    );

    return res;
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json({ error: "Məlumat artıq istifadə olunub (e-poçt, telefon və ya istifadəçi adı)" }, { status: 409 });
    }
    console.error("Registration error:", error);
    return Response.json({ error: "Qeydiyyat zamanı xəta baş verdi" }, { status: 500 });
  }
}
