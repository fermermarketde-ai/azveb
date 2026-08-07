import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET /api/brands — public list of active brands; admin can see all with ?all=true
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const withProducts = searchParams.get("withProducts") === "true";
  const all = searchParams.get("all") === "true";

  // Check if user is admin when requesting all
  let isAdmin = false;
  if (all) {
    const { getAuthUser } = await import("@/lib/auth");
    const user = await getAuthUser(request);
    if (user && !user.error && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      isAdmin = true;
    }
  }

  const brands = await prisma.brand.findMany({
    where: isAdmin ? {} : { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: withProducts ? { _count: { select: { products: { where: { status: "ACTIVE" } } } } } : false,
  });

  return Response.json({ brands });
}

// POST /api/brands — admin only
export async function POST(request) {
  const user = await requireRole(request, ["ADMIN", "SUPER_ADMIN"]);
  if (user.error) return Response.json({ error: user.error }, { status: user.status || 403 });

  try {
    const body = await request.json();
    const { name, country, website, description, logoUrl } = body;
    if (!name) return Response.json({ error: "Brend adı tələb olunur" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const brand = await prisma.brand.create({
      data: { name, slug, country, website, description, logoUrl },
    });

    return Response.json({ brand }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json({ error: "Bu brend artıq mövcuddur" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
