import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET /api/brands/[id] — public brand detail with products
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const brand = await prisma.brand.findUnique({
    where: { id: resolvedParams.id },
    include: {
      products: {
        where: { status: "ACTIVE" },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!brand) return Response.json({ error: "Brend tapılmadı" }, { status: 404 });
  return Response.json({ brand });
}

// PATCH /api/brands/[id] — admin only
export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  const authUser = await getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    const body = await request.json();
    // Whitelist allowed fields for security
    const allowed = {};
    const fields = ["name", "slug", "logoUrl", "country", "website", "description", "isActive", "sortOrder"];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    const brand = await prisma.brand.update({
      where: { id: resolvedParams.id },
      data: allowed,
    });
    return Response.json({ brand });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/brands/[id]
export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const authUser = await getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    await prisma.brand.delete({ where: { id: resolvedParams.id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
