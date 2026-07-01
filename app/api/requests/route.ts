import { NextResponse } from "next/server";
import { apiHandler, requireSession, sendNewRequestAdminEmail } from "@/src/lib/server";
import { requestsService } from "@/src/modules/requests";
import {
  createOrderRequestSchema,
  createProblemRequestSchema,
  createQuestionRequestSchema,
  createIdeaRequestSchema,
} from "@/src/modules/requests/requests.dto";

export const POST = apiHandler(async (req) => {
  const session = await requireSession();
  const body = await req.json();

  // Validate based on request type
  let data;
  const type = body.type;

  if (type === "order") {
    data = createOrderRequestSchema.parse(body);
  } else if (type === "problem") {
    data = createProblemRequestSchema.parse(body);
  } else if (type === "question") {
    data = createQuestionRequestSchema.parse(body);
  } else if (type === "idea") {
    data = createIdeaRequestSchema.parse(body);
  } else {
    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  }

  const request = await requestsService.create(session.user.id, data);

  const meta = (request.metadata ?? {}) as Record<string, unknown>;
  const title =
    data.type === "order" || data.type === "problem"
      ? String(meta.what ?? "")
      : data.type === "question"
        ? String(meta.question ?? "")
        : String(meta.idea ?? "");

  await sendNewRequestAdminEmail({
    employeeName: session.user.name ?? session.user.email,
    requestId: request.id,
    requestType: request.type,
    title,
    priority: request.priority,
    ticketNumber: request.ticketNumber,
  });

  return NextResponse.json(request, { status: 201 });
});

export const GET = apiHandler(async () => {
  const session = await requireSession();

  const requests = await requestsService.listByUser(session.user.id);

  return requests;
});
