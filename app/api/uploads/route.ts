import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/src/lib/server";
import { uploadsService } from "@/src/modules/uploads/uploads.service";

export const POST = apiHandler(async (req) => {
  await requireSession();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const url = await uploadsService.upload(file);
  return NextResponse.json({ url }, { status: 201 });
});
