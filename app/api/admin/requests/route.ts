import { apiHandler, requireRole } from "@/src/lib/server";
import { requestsService } from "@/src/modules/requests";

export const GET = apiHandler(async (req) => {
  await requireRole(["admin", "owner"]);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  return requestsService.listAll({ status, type }, limit, offset);
});
