import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/src/lib/server";
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

  return NextResponse.json(request, { status: 201 });
});

export const GET = apiHandler(async () => {
  const session = await requireSession();

  const requests = await requestsService.listByUser(session.user.id);

  return requests;
});
