import { apiHandler, requireSession, prisma } from "@/src/lib/server";

export const PATCH = apiHandler(async (req) => {
  const session = await requireSession();
  const { image } = await req.json();
  return prisma.user.update({
    where: { id: session.user.id },
    data: { image },
    select: { id: true, name: true, email: true, image: true },
  });
});
