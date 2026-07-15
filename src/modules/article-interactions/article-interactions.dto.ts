import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;
