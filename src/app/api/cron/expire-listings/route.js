import { prisma } from "@/lib/prisma";

// GET/POST /api/cron/expire-listings
// Flips ACTIVE listings whose expiresAt has passed (24h after going live) to EXPIRED,
// which immediately hides them from every public search/category query (they all
// filter on status: "ACTIVE"). Meant to be hit periodically by an external scheduler
// (Base44 Superagent scheduled workflow) — not by end users.
//
// Auth: requires header `Authorization: Bearer ${CRON_SECRET}` matching the
// CRON_SECRET env var configured on Vercel.
async function handle(request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const result = await prisma.product.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { not: null, lte: now },
      },
      data: { status: "EXPIRED" },
    });

    return Response.json({ ok: true, expiredCount: result.count, checkedAt: now.toISOString() });
  } catch (error) {
    console.error("GET /api/cron/expire-listings error:", error);
    return Response.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function GET(request) {
  return handle(request);
}

export async function POST(request) {
  return handle(request);
}
