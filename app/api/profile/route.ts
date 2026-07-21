import { apiHandler, requireSession, prisma } from "@/src/lib/server";

export const GET = apiHandler(async () => {
  const session = await requireSession();
  return prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true },
  });
});

export const PATCH = apiHandler(async (req) => {
  const session = await requireSession();
  const body = await req.json();
  const data: { image?: string | null; bio?: string | null } = {};
  if ("image" in body) data.image = body.image;
  if ("bio" in body) data.bio = body.bio;
  return prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, image: true, bio: true },
  });
});
