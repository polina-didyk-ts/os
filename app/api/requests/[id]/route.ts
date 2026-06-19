import { apiHandler, requireSession } from "@/src/lib/server";
import { requestsService } from "@/src/modules/requests";

export const GET = apiHandler(async (_req, context) => {
  const session = await requireSession();
  const { id } = await context.params;
  return requestsService.getByIdForUser(session.user.id, id);
});
