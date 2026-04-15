import { auth, apiHandler } from "@/src/lib/server";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth);

// GET handler with logging (session checks)
export const GET = apiHandler(async (req) => {
  return originalGET(req);
});

// POST handler with logging
export const POST = apiHandler(async (req) => {
  return originalPOST(req);
});
