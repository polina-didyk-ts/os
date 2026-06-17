import { apiHandler, requireRole, prisma } from "@/src/lib/server";

export const GET = apiHandler(async () => {
  await requireRole(["admin", "owner"]);

  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
});
