import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin / Moderator access: return user list
  if (["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(authUser.role)) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)));

    const where = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    try {
      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            phone: true,
            role: true,
            status: true,
            locale: true,
            createdAt: true,
          },
        }),
      ]);

      return Response.json({
        users,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (error) {
      console.error("Error fetching users list:", error);
      return Response.json({ error: "İstifadəçilər siyahısını almaq mümkün olmadı" }, { status: 500 });
    }
  }

  // Regular user: return self profile
  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.sub },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        locale: true,
        createdAt: true,
      },
    });
    return Response.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return Response.json({ error: "İstifadəçi məlumatlarını almaq mümkün olmadı" }, { status: 500 });
  }
}
