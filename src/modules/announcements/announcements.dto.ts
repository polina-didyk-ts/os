import { z } from "zod";

export const sendAnnouncementSchema = z.object({
  subject: z.string().min(1).max(100),
  message: z.string().min(1).max(2000),
  recipientEmails: z.array(z.string().email()).min(1),
});

export type SendAnnouncementDto = z.infer<typeof sendAnnouncementSchema>;
