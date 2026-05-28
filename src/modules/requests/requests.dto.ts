import { z } from "zod";

// Priority enum
export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const priorityLabels = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
} as const;

// Base schema for all requests
const baseRequestSchema = z.object({
  type: z.enum(["order", "problem", "question", "idea"]),
  priority: z.enum([PRIORITY_LEVELS.LOW, PRIORITY_LEVELS.MEDIUM, PRIORITY_LEVELS.HIGH]),
});

// Order request schema
export const createOrderRequestSchema = baseRequestSchema.extend({
  type: z.literal("order"),
  what: z.string().min(1, "Поле обов'язкове").max(255),
  quantity: z.number().int().positive("Мусить бути більше за 0").min(1),
  comment: z.string().max(500).optional(),
});

export type CreateOrderRequestDto = z.infer<typeof createOrderRequestSchema>;

// Problem request schema
export const createProblemRequestSchema = baseRequestSchema.extend({
  type: z.literal("problem"),
  what: z.string().min(1, "Поле обов'язкове").max(255),
  description: z.string().max(1000).optional(),
  comment: z.string().max(500).optional(),
});

export type CreateProblemRequestDto = z.infer<typeof createProblemRequestSchema>;

// Question request schema
export const createQuestionRequestSchema = baseRequestSchema.extend({
  type: z.literal("question"),
  question: z.string().min(1, "Поле обов'язкове").max(1000),
});

export type CreateQuestionRequestDto = z.infer<typeof createQuestionRequestSchema>;

// Idea request schema
export const createIdeaRequestSchema = baseRequestSchema.extend({
  type: z.literal("idea"),
  idea: z.string().min(1, "Поле обов'язкове").max(500),
});

export type CreateIdeaRequestDto = z.infer<typeof createIdeaRequestSchema>;

// Union type for all create request types
export type CreateRequestDto =
  | CreateOrderRequestDto
  | CreateProblemRequestDto
  | CreateQuestionRequestDto
  | CreateIdeaRequestDto;

// Response schema
export const requestSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  type: z.enum(["order", "problem", "question", "idea"]),
  priority: z.enum([PRIORITY_LEVELS.LOW, PRIORITY_LEVELS.MEDIUM, PRIORITY_LEVELS.HIGH]),
  status: z.enum(["new", "in_progress", "completed", "rejected"]),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RequestResponse = z.infer<typeof requestSchema>;
