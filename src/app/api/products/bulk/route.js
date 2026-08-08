import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request) {
  const authUser = await getAuthUser(request);
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON" }, { status: 400 });
  }

  const { ids, action } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: "Məhsul ID-ləri tələb olunur" }, { status: 400 });
  }

  if (!["activate", "deactivate", "archive", "delete"].includes(action)) {
    return Response.json({ error: "Yanlış əməliyyat" }, { status: 400 });
  }

  // Verify ownership
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, sellerId: true, store: { select: { ownerId: true } } },
  });

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(authUser.role);
  const owned = products.filter(p =>
    p.sellerId === authUser.sub || p.store?.ownerId === authUser.sub
  );

  if (owned.length !== products.length && !isAdmin) {
    return Response.json({ error: "İcazə yoxdur" }, { status: 403 });
  }

  const targetIds = isAdmin ? ids : owned.map(p => p.id);

  let result;
  if (action === "delete") {
    result = await prisma.product.deleteMany({ where: { id: { in: targetIds } } });
  } else {
    const statusMap = { activate: "ACTIVE", deactivate: "DRAFT", archive: "EXPIRED" };
    const data = { status: statusMap[action] };
    // Same 24h auto-expiry window as the single-product PATCH endpoint.
    if (action === "activate") {
      data.publishedAt = new Date();
      data.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    result = await prisma.product.updateMany({
      where: { id: { in: targetIds } },
      data,
    });
  }

  return Response.json({ updated: result.count });
}
