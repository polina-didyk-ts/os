import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export const uploadsService = {
  async upload(file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "bin";
    const blob = await put(`uploads/${randomUUID()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  },
};
